<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Operator-assisted intake for 1688 products.
 *
 * 1688 does not serve product pages to automated clients (anti-bot "punish" page, "Captcha Interception"
 * even in a normal browser from outside China), and there is no data in a share link beyond the offer ID.
 * So this command does NOT fetch anything: the operator opens the product in the 1688 app, copies the share
 * link / product ID and types in what the app shows. The result goes to a queue file in exactly the format
 * `products:import-trendyol --source=1688` reads. Missing fields stay null and are reported, never invented.
 */
class Capture1688Product extends Command
{
    protected $signature = 'products:capture-1688
        {input : Share link, product URL, or numeric offer ID}
        {--title= : Original (Chinese) title as shown in the app}
        {--title-en= : Optional English title used as the product name}
        {--price= : Price in CNY that you want to import (e.g. the tier for your order quantity)}
        {--tiers= : Price tiers as shown, e.g. "1-9:12.5,10-99:11,100+:9.8" (kept in the plan only)}
        {--moq= : Minimum order quantity shown in the app}
        {--image=* : Image URL (repeat the option for each image)}
        {--sku=* : SKU / option name (repeat for each)}
        {--description= : Description text, only if the app shows one}
        {--resolve : Resolve a short qr.1688.com share link to its offer ID (one request to the short-link host)}
        {--queue= : Queue file (default storage/app/import/1688-queue.json)}';

    protected $description = 'Add one 1688 product (from a share link / ID plus operator-typed fields) to the import queue';

    public function handle(): int
    {
        $raw = trim((string)$this->argument('input'));
        $offerId = $this->offerId($raw);
        // A short share link (qr.1688.com/s/<code>) has no ID. With --resolve we read what it points to (one request to
        // the short-link host; the product page itself is never fetched).
        if ($offerId === null && $this->option('resolve') && preg_match('~https?://qr\.1688\.com/s/[A-Za-z0-9]+~', $raw, $m)) {
            try {
                $resp = \Illuminate\Support\Facades\Http::withUserAgent('RamzshopShareLink/1.0 (contact: mahdishadow658@gmail.com)')->timeout(20)->get($m[0]);
                $offerId = $resp->successful() ? $this->offerId(urldecode($resp->body())) : null;
            } catch (\Throwable $e) {
                $offerId = null;
            }
        }
        if ($offerId === null) {
            $this->error('No 1688 offer ID found in the input.');
            $this->line('Short/QR share links (qr.1688.com/...) do not contain the ID. Open the link on the phone or in a browser,');
            $this->line('copy the final address (it contains /offer/<digits>.html) or just the digits, and run this command again.');
            return self::FAILURE;
        }

        $record = [
            'source_id' => $offerId,
            'title' => $this->text('title'),
            'title_en' => $this->text('title-en'),
            'sale_price' => $this->number('price'),
            'currency' => 'CNY',
            'price_tiers' => $this->option('tiers') ?: null,
            'min_order_qty' => $this->option('moq') !== null ? (int)$this->option('moq') : null,
            'image_urls' => array_values(array_filter(array_map('trim', (array)$this->option('image')))),
            'skus' => array_values(array_filter(array_map('trim', (array)$this->option('sku')))),
            'description' => $this->text('description'),
            'product_url' => "https://detail.1688.com/offer/{$offerId}.html",
            'availability' => null,
            'rating' => null, 'review_count' => null, 'stock_quantity' => null, 'sizes' => null,
        ];

        $queue = $this->option('queue') ?: storage_path('app/import/1688-queue.json');
        $items = File::exists($queue) ? (json_decode(File::get($queue), true) ?: []) : [];
        $updated = false;
        foreach ($items as $i => $it) {
            if (($it['source_id'] ?? null) === $offerId) {
                // update only the fields the operator gave now; keep what was captured before
                foreach ($record as $k => $v) {
                    if ($v !== null && $v !== []) $items[$i][$k] = $v;
                }
                $record = $items[$i];
                $updated = true;
                break;
            }
        }
        if (!$updated) $items[] = $record;

        File::ensureDirectoryExists(dirname($queue));
        File::put($queue, json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        $this->info(($updated ? 'Updated' : 'Added') . " offer $offerId in $queue (" . count($items) . ' in queue).');
        $missing = [];
        foreach (['title' => 'title', 'sale_price' => 'price', 'min_order_qty' => 'moq', 'image_urls' => 'images', 'skus' => 'skus', 'description' => 'description'] as $key => $label) {
            if (empty($record[$key]) && $record[$key] !== 0) $missing[] = $label;
        }
        $this->line('Source URL: ' . $record['product_url']);
        $this->line($missing ? 'Not provided (stays empty, nothing invented): ' . implode(', ', $missing) : 'All capture fields provided.');
        if (isset($record['limit_note'])) $this->warn($record['limit_note']);
        $this->line('Preview with: php artisan products:import-trendyol ' . $queue . ' --source=1688 --rate-source-usd=<CNY->USD> --rate-usd-tjs=<USD->TJS>');
        return self::SUCCESS;
    }

    private function offerId(string $raw): ?string
    {
        $raw = urldecode($raw);                                                              // deep links carry the URL encoded
        if (preg_match('/^\d{9,15}$/', $raw)) return $raw;                                   // plain ID
        if (preg_match('~(?:detail|m|www)\.1688\.com/(?:[a-z]+/)?offer/(\d{9,15})~i', $raw, $m)) return $m[1]; // PC / mobile
        if (preg_match('/[?&](?:offerId|offer_id|id)=(\d{9,15})/i', $raw, $m)) return $m[1];    // query parameter
        if (preg_match('~/offer/(\d{9,15})~', $raw, $m)) return $m[1];                          // any host with /offer/<id>
        return null;
    }

    private function text(string $opt): ?string
    {
        $v = $this->option($opt);
        return $v !== null && trim($v) !== '' ? trim($v) : null;
    }

    private function number(string $opt): ?float
    {
        $v = $this->option($opt);
        return $v !== null && is_numeric($v) ? (float)$v : null;
    }
}
