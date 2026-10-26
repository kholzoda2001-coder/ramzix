<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

/**
 * Collects products from the official CJ Dropshipping API (api2.0) into a JSON file for products:import-trendyol --source=cj.
 * Needs CJ_API_KEY in .env. Read only: nothing is written to the shop database. One request per 1.2 s (CJ limit: 1 call/s).
 */
class FetchCjProducts extends Command
{
    protected $signature = 'products:fetch-cj
        {--keyword= : Search words (product name or SKU)}
        {--category-id= : CJ category id}
        {--country= : Warehouse country code, e.g. CN, US}
        {--limit=20 : How many products to collect (max 100)}
        {--category= : Shop category name every collected product will go to}
        {--brand= : Shop brand name for every collected product}
        {--min-variants=1 : Skip products that have fewer variants (use 2 for products with colours/sizes)}
        {--out= : Output JSON file}';

    protected $description = 'Collect products from the CJ Dropshipping API into an importer file (read only)';

    private const BASE = 'https://developers.cjdropshipping.com/api2.0/v1/';

    public function handle(): int
    {
        $key = (string)env('CJ_API_KEY');
        if ($key === '') {
            $this->error('CJ_API_KEY is empty. Put your CJ API key in .env as CJ_API_KEY=... (do not paste it in chat), then run again.');
            return self::FAILURE;
        }
        $token = $this->token($key);
        if (!$token) return self::FAILURE;

        $limit = max(1, min(100, (int)$this->option('limit')));
        $query = array_filter([
            'keyWord' => $this->option('keyword'), 'categoryId' => $this->option('category-id'),
            'countryCode' => $this->option('country'), 'page' => 1, 'size' => min(100, max($limit, (int)$this->option('min-variants') > 1 ? $limit * 6 : $limit)), 'features' => 'enable_description',
        ], fn($v) => $v !== null && $v !== '');
        $list = $this->get('product/listV2', $query, $token);
        $rows = [];
        foreach (($list['data']['content'] ?? []) as $block) foreach (($block['productList'] ?? []) as $p) $rows[] = $p;
        if ((int)$this->option('min-variants') <= 1) $rows = array_slice($rows, 0, $limit);
        if (!$rows) {
            $this->warn('CJ returned no products for this search.');
            return self::SUCCESS;
        }

        $eligible = [];
        $excluded = [];
        foreach ($rows as $i => $row) {
            if (count($eligible) >= $limit) break;
            $pid = (string)($row['id'] ?? '');
            $d = $this->get('product/query', ['pid' => $pid], $token)['data'] ?? null;
            if (!$d) { $excluded[] = ['source_id' => $pid, 'reason' => 'no detail from CJ']; continue; }
            $variants = $d['variants'] ?? [];
            $prices = array_values(array_filter(array_map(fn($v) => is_numeric($v['variantSellPrice'] ?? null) ? (float)$v['variantSellPrice'] : null, $variants)));
            $price = $prices ? min($prices) : $this->firstNumber($d['sellPrice'] ?? $row['sellPrice'] ?? null);
            $weightG = $this->firstNumber($d['productWeight'] ?? null);
            $images = array_values(array_unique(array_filter(array_merge(
                is_array($d['productImageSet'] ?? null) ? $d['productImageSet'] : [], [$d['bigImage'] ?? null]))));
            if (!$price) { $excluded[] = ['source_id' => $pid, 'reason' => 'no numeric price']; continue; }
            if (count($variants) < (int)$this->option('min-variants')) { $excluded[] = ['source_id' => $pid, 'reason' => 'fewer than ' . $this->option('min-variants') . ' variants']; continue; }
            $eligible[] = [
                'source_id' => $pid, 'sku' => $d['productSku'] ?? null,
                'title' => trim((string)($d['productNameEn'] ?? $row['nameEn'] ?? '')),
                'brand' => $this->option('brand'), 'category' => $this->option('category'),
                'sale_price' => $price, 'currency' => 'USD', 'availability' => null,
                'weight_kg' => $weightG ? round($weightG / 1000, 3) : null,
                'weight_basis' => $weightG ? 'CJ productWeight (grams) / 1000' : null,
                'image_urls' => array_slice($images, 0, 8), 'product_url' => 'https://cjdropshipping.com/product/-p-' . $pid . '.html',
                'description' => trim(preg_replace('/\s+/', ' ', strip_tags((string)($d['description'] ?? '')))) ?: null,
                'rating' => null, 'review_count' => null, 'stock_quantity' => null, 'sizes' => null,
                'variant_names' => array_values(array_filter(array_map(fn($v) => $v['variantNameEn'] ?? null, $variants))),
                'variants' => count($variants) > 1 ? array_values(array_filter(array_map(function ($v) use ($weightG) {
                    $vp = is_numeric($v['variantSellPrice'] ?? null) ? (float)$v['variantSellPrice'] : null;
                    $name = trim((string)($v['variantKey'] ?? $v['variantNameEn'] ?? ''));
                    if (!$vp || $name === '') return null;
                    $vw = $this->firstNumber($v['variantWeight'] ?? null);
                    return ['name' => $name, 'sku' => $v['variantSku'] ?? null, 'sale_price' => $vp, 'weight_kg' => $vw ? round($vw / 1000, 3) : ($weightG ? round($weightG / 1000, 3) : null), 'image' => $v['variantImage'] ?? null];
                }, $variants))) : null,
            ];
            $this->line(($i + 1) . '/' . count($rows) . " $pid: " . mb_substr((string)end($eligible)['title'], 0, 60) . " ($price USD)");
        }
        $out = $this->option('out') ?: storage_path('app/import/cj-' . date('Ymd-His') . '.json');
        File::ensureDirectoryExists(dirname($out));
        File::put($out, json_encode(['source' => 'CJ Dropshipping API', 'retrieved' => date('Y-m-d'), 'eligible' => $eligible, 'excluded' => $excluded], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $this->info(count($eligible) . ' products collected, ' . count($excluded) . " excluded. File: $out");
        return self::SUCCESS;
    }

    private function firstNumber($v): ?float
    {
        if (is_numeric($v)) return (float)$v;
        return preg_match('/\d+(?:\.\d+)?/', (string)$v, $m) ? (float)$m[0] : null;     // CJ sometimes returns a range like "2.5 -- 4.0"
    }

    private function get(string $path, array $query, string $token): array
    {
        usleep(1200000);
        $r = Http::withHeaders(['CJ-Access-Token' => $token])->timeout(60)->retry(2, 2000, throw: false)->get(self::BASE . $path, $query);
        return $r->json() ?? [];
    }

    /** access token is valid ~180 days: kept in storage so that getAccessToken is called as rarely as possible */
    private function token(string $key): ?string
    {
        $file = storage_path('app/cj-token.json');
        if (is_file($file)) {
            $t = json_decode(file_get_contents($file), true);
            if (!empty($t['accessToken']) && !empty($t['expiry']) && strtotime($t['expiry']) > time() + 86400) return $t['accessToken'];
        }
        $r = Http::timeout(60)->post(self::BASE . 'authentication/getAccessToken', ['apiKey' => $key])->json();
        $d = $r['data'] ?? null;
        if (!$d || empty($d['accessToken'])) {
            $this->error('CJ did not give a token: ' . ($r['message'] ?? 'unknown error'));
            return null;
        }
        file_put_contents($file, json_encode(['accessToken' => $d['accessToken'], 'expiry' => $d['accessTokenExpiryDate'] ?? null]));
        return $d['accessToken'];
    }
}
