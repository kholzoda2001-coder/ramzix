<?php

namespace App\Console\Commands;

use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

/**
 * Attaches the images recorded in the import ledger to the imported products.
 * Only runs because the shop owner confirmed that Trendyol allows re-use of its product images.
 * Downloads everything first; nothing is written unless ALL images were fetched and decoded.
 */
class ImportTrendyolImages extends Command
{
    protected $signature = 'products:import-trendyol-images
        {batch : Batch id from the product import}
        {--select= : Only these images, e.g. "15:0;21:0,1" = product 15 image 0, product 21 images 0 and 1 (products not listed get none)}
        {--commit : Download and write (default is a dry run that only lists what would be fetched)}
        {--manifest= : Where to write the list of created files}';

    protected $description = 'Download the recorded Trendyol images for an imported batch and attach them to the products';

    private const MAX_BYTES = 25 * 1024 * 1024;

    public function handle(): int
    {
        $batch = (string)$this->argument('batch');
        $rows = DB::table('product_import_sources')->where('batch_id', $batch)->get();
        if ($rows->isEmpty()) {
            $this->error("No ledger rows for batch $batch.");
            return self::FAILURE;
        }

        // --select lets the operator keep only reviewed product shots (e.g. no banners / infographics)
        $select = null;
        if ($this->option('select')) {
            $select = [];
            foreach (explode(';', (string)$this->option('select')) as $part) {
                [$pid, $idx] = array_pad(explode(':', $part, 2), 2, '');
                $select[(int)$pid] = array_map('intval', array_filter(explode(',', $idx), 'strlen'));
            }
        }

        $plan = [];
        foreach ($rows as $r) {
            $urls = json_decode($r->source_image_urls ?? '[]', true) ?: [];
            if ($select !== null) {
                $keep = $select[(int)$r->product_id] ?? [];
                $urls = array_values(array_intersect_key($urls, array_flip($keep)));
                if (!$urls) continue;
            }
            $plan[] = ['product_id' => $r->product_id, 'source_id' => $r->source_id, 'urls' => array_map(fn($u) => str_replace('/mnresize/400/-/', '/', $u), $urls)];
        }
        $total = array_sum(array_map(fn($p) => count($p['urls']), $plan));
        foreach ($plan as $p) $this->line("product #{$p['product_id']} ({$p['source_id']}): " . count($p['urls']) . ' image(s)');
        $this->line("Total images: $total");

        if (!$this->option('commit')) {
            $this->info('DRY RUN: nothing downloaded or written.');
            return self::SUCCESS;
        }

        // 1) download + decode everything into memory first
        $fetched = [];
        foreach ($plan as $p) {
            foreach ($p['urls'] as $i => $url) {
                try {
                    // large PNGs over a slow link: long timeout, a few retries; any failure aborts before anything is written
                    $resp = Http::withUserAgent('RamzshopImageImport/1.0 (contact: mahdishadow658@gmail.com)')->timeout(150)->retry(3, 3000, throw: false)->get($url);
                } catch (\Throwable $e) {
                    $this->error("Download failed for {$p['source_id']} #$i ($url): {$e->getMessage()}. Nothing was written.");
                    return self::FAILURE;
                }
                $type = $resp->header('Content-Type');
                if (!$resp->successful() || !str_starts_with((string)$type, 'image/') || strlen($resp->body()) > self::MAX_BYTES || strlen($resp->body()) < 1000) {
                    $this->error("Failed/invalid image for {$p['source_id']} #$i ($url): HTTP {$resp->status()} $type, " . strlen($resp->body()) . ' bytes. Nothing was written.');
                    return self::FAILURE;
                }
                try {
                    $img = Image::make($resp->body());
                    $fetched[$p['product_id']][$i] = ['webp' => (string)$img->encode('webp', 85), 'w' => $img->width(), 'h' => $img->height(), 'src' => $url, 'bytes' => strlen($resp->body())];
                } catch (\Throwable $e) {
                    $this->error("Cannot decode image for {$p['source_id']} #$i: {$e->getMessage()}. Nothing was written.");
                    return self::FAILURE;
                }
                usleep(1000000);
            }
        }

        // 2) write files, then update the products in one transaction; remove files if anything fails
        $disk = Storage::disk('public');
        $created = [];
        try {
            DB::transaction(function () use ($fetched, $disk, &$created) {
                foreach ($fetched as $productId => $imgs) {
                    $names = [];
                    foreach ($imgs as $i => $im) {
                        $name = Carbon::now()->toDateString() . '-' . uniqid() . '.webp';
                        $disk->put('product/' . $name, $im['webp']);
                        $created[] = 'product/' . $name;
                        $names[] = ['image_name' => $name, 'storage' => 'public'];
                        if ($i === 0) {
                            $disk->put('product/thumbnail/' . $name, $im['webp']);
                            $created[] = 'product/thumbnail/' . $name;
                            $thumb = $name;
                        }
                    }
                    Product::withoutGlobalScopes()->where('id', $productId)->firstOrFail()->forceFill([
                        'images' => json_encode($names), 'thumbnail' => $thumb, 'thumbnail_storage_type' => 'public',
                    ])->save();
                }
            });
        } catch (\Throwable $e) {
            foreach ($created as $f) $disk->delete($f);
            $this->error('Write failed, files removed, database unchanged: ' . $e->getMessage());
            return self::FAILURE;
        }

        $manifest = $this->option('manifest') ?: storage_path('app/import/images-' . $batch . '.json');
        File::ensureDirectoryExists(dirname($manifest));
        File::put($manifest, json_encode(['batch' => $batch, 'files' => $created, 'images' => $fetched ? array_map(fn($g) => array_map(fn($x) => ['src' => $x['src'], 'width' => $x['w'], 'height' => $x['h'], 'source_bytes' => $x['bytes']], $g), $fetched) : []], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        $this->info('Attached ' . array_sum(array_map('count', $fetched)) . ' images to ' . count($fetched) . ' products. Manifest: ' . $manifest);
        return self::SUCCESS;
    }
}
