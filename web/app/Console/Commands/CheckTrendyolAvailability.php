<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

/**
 * Re-checks whether the imported products are still available on the source page and keeps the 6Valley
 * stock in line: unavailable -> stock 0; available again -> configured restock amount (only if stock is 0).
 * Dry run by default. One polite request per product, spaced out. If a page cannot be read or parsed the
 * product is reported as "unknown" and left untouched. Prices are NOT changed here.
 */
class CheckTrendyolAvailability extends Command
{
    protected $signature = 'products:check-availability
        {--commit : Apply the stock changes (default: dry run)}
        {--limit=20 : Maximum number of products to check per run}';

    protected $description = 'Check source availability of imported Trendyol products and sync stock to 0 / restock amount';

    public function handle(): int
    {
        $rows = DB::table('product_import_sources')->where('source', 'trendyol')->orderBy('id')->limit((int)$this->option('limit'))->get();
        if ($rows->isEmpty()) {
            $this->warn('No imported products in the ledger.');
            return self::SUCCESS;
        }
        $restock = (int)config('trendyol_import.available_stock');
        $report = [];
        $first = true;
        foreach ($rows as $r) {
            if (!$first) sleep((int)config('trendyol_import.check_delay_seconds'));
            $first = false;
            $product = Product::withoutGlobalScopes()->find($r->product_id);
            if (!$product) continue;

            $state = $this->readState($r->source_url);
            $action = 'none';
            $newStock = $product->current_stock;
            if ($state['status'] === 'unavailable' && $product->current_stock > 0) {
                $action = 'set stock 0';
                $newStock = 0;
            } elseif ($state['status'] === 'available' && $product->current_stock == 0) {
                $action = "restock to $restock";
                $newStock = $restock;
            }
            $report[] = ['product_id' => $product->id, 'code' => $product->code, 'source' => $state['status'], 'detail' => $state['detail'], 'stock_now' => $product->current_stock, 'action' => $action, 'new_stock' => $newStock];
        }

        $this->table(['id', 'code', 'source says', 'detail', 'stock now', 'action'], array_map(fn($x) => [$x['product_id'], $x['code'], $x['source'], $x['detail'], $x['stock_now'], $x['action']], $report));

        $changes = array_filter($report, fn($x) => $x['action'] !== 'none');
        if ($this->option('commit') && $changes) {
            DB::transaction(function () use ($changes) {
                foreach ($changes as $c) {
                    Product::withoutGlobalScopes()->where('id', $c['product_id'])->firstOrFail()->forceFill(['current_stock' => $c['new_stock']])->save();
                }
            });
            $this->info(count($changes) . ' product(s) updated.');
        } else {
            $this->info($this->option('commit') ? 'Nothing to change.' : 'DRY RUN: nothing was changed. ' . count($changes) . ' change(s) would be made.');
        }

        $log = storage_path('app/import/availability-log.jsonl');
        File::ensureDirectoryExists(dirname($log));
        File::append($log, json_encode(['at' => now()->toDateTimeString(), 'commit' => (bool)$this->option('commit'), 'results' => $report], JSON_UNESCAPED_SLASHES) . PHP_EOL);
        return self::SUCCESS;
    }

    /** @return array{status: string, detail: string} status: available|unavailable|unknown */
    private function readState(?string $url): array
    {
        if (!$url) return ['status' => 'unknown', 'detail' => 'no source url'];
        try {
            $resp = Http::withUserAgent('RamzshopStockCheck/1.0 (contact: mahdishadow658@gmail.com)')->timeout(30)->get($url);
        } catch (\Throwable $e) {
            return ['status' => 'unknown', 'detail' => 'request failed'];
        }
        if ($resp->status() === 404 || $resp->status() === 410) return ['status' => 'unavailable', 'detail' => 'page gone (HTTP ' . $resp->status() . ')'];
        if (!$resp->successful()) return ['status' => 'unknown', 'detail' => 'HTTP ' . $resp->status()];

        $html = $resp->body();
        $at = strpos($html, '"variants":[{');
        if ($at === false) return ['status' => 'unknown', 'detail' => 'no variant data in page'];
        $start = strpos($html, '[', $at);
        $depth = 0; $inStr = false; $esc = false; $end = null;
        for ($i = $start, $n = strlen($html); $i < $n; $i++) {
            $c = $html[$i];
            if ($inStr) { if ($esc) $esc = false; elseif ($c === chr(92)) $esc = true; elseif ($c === '"') $inStr = false; continue; }
            if ($c === '"') $inStr = true;
            elseif ($c === '[' || $c === '{') $depth++;
            elseif ($c === ']' || $c === '}') { if (--$depth === 0) { $end = $i; break; } }
        }
        $variants = $end ? json_decode(substr($html, $start, $end - $start + 1), true) : null;
        if (!is_array($variants) || $variants === []) return ['status' => 'unknown', 'detail' => 'variant data not readable'];

        $ok = array_filter($variants, fn($v) => ($v['inStock'] ?? false) && ($v['sellable'] ?? true));
        $running = array_sum(array_map(fn($v) => (int)($v['runningOutQuantity'] ?? 0), $variants));
        if ($ok) return ['status' => 'available', 'detail' => count($ok) . '/' . count($variants) . ' variant(s) in stock' . ($running ? ", running out ($running left)" : '')];
        return ['status' => 'unavailable', 'detail' => 'no variant in stock'];
    }
}
