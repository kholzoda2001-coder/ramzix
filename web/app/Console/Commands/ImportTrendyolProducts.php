<?php

namespace App\Console\Commands;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Imports at most 5 collected products as DRAFT products (status = 0).
 *
 * Default is a dry run. Writing needs --commit AND --confirm-plan=<hash printed by the dry run>, so only the
 * exact plan that was reviewed can be written. Everything happens in one transaction. A batch can be undone
 * with --rollback=<batch id> (also a dry run unless --commit is given).
 *
 * Images are never downloaded or republished; descriptions, stock, sizes and variants are never invented.
 */
class ImportTrendyolProducts extends Command
{
    protected $signature = 'products:import-trendyol
        {file? : JSON file with the collected products}
        {--rate-aed-usd= : USD per 1 unit of the source currency (or TRENDYOL_IMPORT_RATE_AED_USD). No default.}
        {--rate-source-usd= : Same as --rate-aed-usd, for sources whose currency is not AED (e.g. SAR for shein).}
        {--rate-usd-tjs= : Display-currency units per 1 USD (or TRENDYOL_IMPORT_RATE_USD_TJS). No default.}
        {--fee= : Service fee percent added to the converted price (default from config, 10)}
        {--shipping-per-kg= : USD per kg added to the price BEFORE the service fee (each item needs weight_kg). Without it delivery stays separate.}
        {--source=trendyol : Source of the file: trendyol or noon}
        {--category= : Put every product into this top-level category (overrides the source default)}
        {--commit : Actually write to the database (needs --confirm-plan)}
        {--confirm-plan= : Plan hash printed by the dry run}
        {--rollback= : Batch id to remove (dry run unless --commit)}
        {--report= : Where to write the JSON plan}';

    protected $description = 'Import up to 5 collected products as drafts (dry run by default)';

    /** Source-specific settings: ledger name, product code prefix and the (separate) category its products go into. */
    private const SOURCES = [
        'trendyol' => ['prefix' => 'TY-', 'category' => null],          // category comes from the data
        'noon' => ['prefix' => 'NO-', 'category' => "Men's Clothing"],
        'shein' => ['prefix' => 'SH-', 'category' => "Men's Clothing", 'currency' => 'SAR'],
        '1688' => ['prefix' => 'AB-', 'category' => '1688 China', 'currency' => 'CNY'],
        'cj' => ['prefix' => 'CJ-', 'category' => null, 'currency' => 'USD'],
        'anker' => ['prefix' => 'AK-', 'category' => 'Earbuds & Audio', 'currency' => 'AED'],
    ];

    private string $source = 'trendyol';

    public function handle(): int
    {
        if ($this->option('rollback')) {
            return $this->rollback((string)$this->option('rollback'));
        }
        if (!$this->argument('file')) {
            $this->error('Give the JSON file to import.');
            return self::FAILURE;
        }
        $this->source = (string)$this->option('source');
        if (!isset(self::SOURCES[$this->source])) {
            $this->error('Unknown --source. Use: ' . implode(', ', array_keys(self::SOURCES)));
            return self::FAILURE;
        }

        $plan = $this->buildPlan();
        if ($plan === null) {
            return self::FAILURE;
        }
        $this->printPlan($plan);

        $report = $this->option('report') ?: storage_path('app/import/' . $this->source . '-plan.json');
        File::ensureDirectoryExists(dirname($report));
        File::put($report, json_encode($plan, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $this->line("Plan written to: $report");

        if (!$this->option('commit')) {
            $this->info('DRY RUN: nothing was written to the database. Nothing was downloaded.');
            $this->line('To write, review the plan above, then re-run with: --commit --confirm-plan=' . $plan['plan_hash']);
            return self::SUCCESS;
        }

        return $this->commit($plan);
    }

    private function buildPlan(): ?array
    {
        $path = $this->argument('file');
        if (!File::exists($path)) {
            $this->error("File not found: $path");
            return null;
        }
        $items = json_decode(ltrim(File::get($path), "\xEF\xBB\xBF"), true); // tolerate a UTF-8 BOM (Windows editors add one)
        if (is_array($items) && isset($items['eligible']) && is_array($items['eligible'])) {
            $items = $items['eligible']; // collected-sample files keep eligible and excluded products apart
        }
        $max = (int)config('trendyol_import.max_products');
        if (!is_array($items) || $items === []) {
            $this->error('The file is not a non-empty JSON array.');
            return null;
        }
        if (count($items) > $max) {
            $this->error('Too many products: ' . count($items) . " (limit $max per run).");
            return null;
        }

        $sourceCurrency = self::SOURCES[$this->source]['currency'] ?? config('trendyol_import.source_currency');
        $displayCurrency = config('trendyol_import.display_currency');
        $rate = $this->option('rate-source-usd') ?? $this->option('rate-aed-usd') ?? config('trendyol_import.rate_source_to_usd');
        $rateDisplay = $this->option('rate-usd-tjs') ?? config('trendyol_import.rate_usd_to_display');
        foreach ([["{$sourceCurrency}->USD", $rate, '--rate-aed-usd / TRENDYOL_IMPORT_RATE_AED_USD'], ["USD->$displayCurrency", $rateDisplay, '--rate-usd-tjs / TRENDYOL_IMPORT_RATE_USD_TJS']] as [$label, $value, $how]) {
            if ($value === null || $value === '' || !is_numeric($value) || (float)$value <= 0) {
                $this->error("Rate $label is missing or invalid. It has no default and must be given explicitly ($how).");
                return null;
            }
        }
        $rate = (float)$rate;
        $rateDisplay = (float)$rateDisplay;
        $fee = $this->option('fee') ?? config('trendyol_import.service_fee_percent');
        if (!is_numeric($fee) || (float)$fee < 0) {
            $this->error('Invalid service fee percent.');
            return null;
        }
        $fee = (float)$fee;
        $shipPerKg = $this->option('shipping-per-kg');
        if ($shipPerKg !== null && (!is_numeric($shipPerKg) || (float)$shipPerKg < 0)) {
            $this->error('Invalid --shipping-per-kg.');
            return null;
        }
        $shipPerKg = $shipPerKg !== null ? (float)$shipPerKg : null;

        $admin = Admin::query()->first();
        $shop = Shop::where('author_type', 'admin')->first();
        $ledgerReady = Schema::hasTable('product_import_sources');

        $global = [];
        if (!$admin) $global[] = 'BLOCKER: no admin user found.';
        if (!$shop) $global[] = 'BLOCKER: no in-house shop found.';
        if (!$ledgerReady) {
            $global[] = 'BLOCKER: table product_import_sources is missing (run its migration first); duplicate protection by ledger is unavailable.';
        } elseif (!Schema::hasColumn('product_import_sources', 'final_price_display')) {
            $global[] = 'BLOCKER: ledger migration 2026_10_24_130000 (price breakdown columns) is not applied yet.';
        }
        $currencyRow = DB::table('currencies')->where('code', $displayCurrency)->first();
        if (!$currencyRow) {
            $global[] = "BLOCKER: currency $displayCurrency does not exist in 6Valley.";
        } else {
            if (abs((float)$currencyRow->exchange_rate - $rateDisplay) > 0.000001) {
                $global[] = "BLOCKER: 6Valley's $displayCurrency exchange_rate ({$currencyRow->exchange_rate}) differs from --rate-usd-tjs ($rateDisplay). The storefront converts with the 6Valley value, so they must match.";
            }
            if ((int)$currencyRow->status !== 1) {
                $global[] = "WARNING: currency $displayCurrency is inactive in 6Valley, customers cannot select it yet.";
            }
        }
        $global[] = 'Images are NOT part of this step: products get the default placeholder image; attach the recorded images afterwards with products:import-trendyol-images <batch> --commit.';
        $global[] = $shipPerKg === null
            ? 'Delivery is NOT included in any price and no delivery cost is written (no source data); it is calculated separately.'
            : "Shipping is INCLUDED in the price: weight_kg x {$shipPerKg} USD/kg, added before the service fee. Weights come from the operator, not from the source page. No per-product shipping_cost is written to 6Valley.";

        $products = [];
        $newCategories = [];
        $seenIds = [];
        $seenSlugs = [];
        foreach ($items as $it) {
            $errors = [];
            $missing = [];
            $sourceId = isset($it['source_id']) ? (string)$it['source_id'] : '';
            // An operator-supplied English title wins; the original title (e.g. Chinese) is kept in the plan.
            $title = trim((string)($it['title_en'] ?? $it['title'] ?? ''));
            if ($sourceId === '') $errors[] = 'source_id missing';
            if ($title === '') $errors[] = 'title missing';
            if (!isset($it['sale_price']) || !is_numeric($it['sale_price'])) $errors[] = 'sale_price missing';
            if (($it['currency'] ?? null) !== $sourceCurrency) $errors[] = "currency is '" . ($it['currency'] ?? 'null') . "', expected $sourceCurrency (no guessing)";
            if (isset($seenIds[$sourceId])) $errors[] = 'duplicate source_id inside the file';
            $seenIds[$sourceId] = true;

            $code = self::SOURCES[$this->source]['prefix'] . $sourceId;
            if ($sourceId !== '' && Product::withoutGlobalScopes()->where('code', $code)->exists()) $errors[] = "product code $code already exists";
            if ($ledgerReady && $sourceId !== '' && DB::table('product_import_sources')->where('source', $this->source)->where('source_id', $sourceId)->exists()) {
                $errors[] = 'already imported (ledger)';
            }

            $slug = Str::slug($title, '-') . '-' . substr(md5($this->source . $sourceId), 0, 6);
            if (isset($seenSlugs[$slug]) || Product::withoutGlobalScopes()->where('slug', $slug)->exists()) $errors[] = 'slug already used';
            $seenSlugs[$slug] = true;

            $categoryName = trim((string)($this->option('category') ?: ($it['category'] ?? null) ?: (self::SOURCES[$this->source]['category'] ?? '')));
            $category = $categoryName !== '' ? Category::where('name', $categoryName)->where('parent_id', 0)->first() : null;
            if ($categoryName === '') {
                $missing[] = 'category';
            } elseif (!$category) {
                $newCategories[$categoryName] = true;
            }

            // Observed vs missing: nothing below is filled with an invented value.
            // Description is only used when the source really provided text (never a placeholder).
            $details = isset($it['description']) && is_string($it['description']) && trim($it['description']) !== '' ? trim($it['description']) : null;
            // Sizes seen on the source page go into the description (6Valley products are imported without variants).
            $realDescription = $details;
            if (!empty($it['sizes']) && is_array($it['sizes'])) {
                $sizeLine = 'Available sizes: ' . implode(', ', $it['sizes']) . '.';
                $details = $details ? $details . "\n\n" . $sizeLine : $sizeLine;
            }
            if (!empty($it['price_unverified'])) $missing[] = 'price (lowest variant price not verified: ' . $it['price_unverified'] . ')';
            if (mb_strlen($title) > 255) $errors[] = 'title is longer than 255 characters (' . mb_strlen($title) . ')';
            foreach (['description' => $realDescription, 'stock' => $it['stock'] ?? null, 'sizes' => $it['sizes'] ?? null] as $field => $value) {
                if ($value === null) $missing[] = $field;
            }
            if (isset($it['availability']) && $it['availability'] !== 'InStock') $errors[] = "source availability is '{$it['availability']}', not InStock";
            $missing[] = 'variants (not in source)';
            // Minimum order quantity (e.g. 1688 wholesale): only used when the source states it.
            $moq = isset($it['min_order_qty']) && is_numeric($it['min_order_qty']) && (int)$it['min_order_qty'] >= 1 ? (int)$it['min_order_qty'] : 1;
            if (!isset($it['min_order_qty'])) $missing[] = 'min_order_qty (using 1)';
            // SKU / option names seen on the source page go into the description, like sizes do.
            if (!empty($it['skus']) && is_array($it['skus'])) {
                $names = array_filter(array_map(fn($s) => is_array($s) ? ($s['name'] ?? null) : (string)$s, $it['skus']));
                if ($names) {
                    $skuLine = 'Options: ' . implode('; ', $names) . '.';
                    $details = $details ? $details . "\n\n" . $skuLine : $skuLine;
                }
            }
            if (empty($it['image_urls'])) $missing[] = 'images';
            if (!isset($it['rating'])) $missing[] = 'rating';
            if (!isset($it['review_count'])) $missing[] = 'review_count';

            $salePrice = isset($it['sale_price']) && is_numeric($it['sale_price']) ? (float)$it['sale_price'] : null;
            // Shipping: either added to the price (when --shipping-per-kg is given and the item has a weight) or left separate.
            $weightKg = isset($it['weight_kg']) && is_numeric($it['weight_kg']) ? (float)$it['weight_kg'] : null;
            if ($shipPerKg === null) {
                $missing[] = 'delivery_cost (calculated separately)';
            } elseif ($weightKg === null) {
                $errors[] = 'weight_kg missing (needed to add shipping to the price)';
            }
            $shipping = ($shipPerKg !== null && $weightKg !== null) ? round($weightKg * $shipPerKg, 4) : 0.0;
            $converted = $salePrice !== null ? round($salePrice * $rate, 4) : null;
            $feeAmount = $converted !== null ? round(($converted + $shipping) * $fee / 100, 4) : null;
            $selling = $converted !== null ? round($converted + $shipping + $feeAmount, 4) : null;
            // variants (colour / type): every variant has its own price, built with the same formula; the product shows the cheapest one
            $variantRows = [];
            if (!empty($it['variants']) && is_array($it['variants']) && count($it['variants']) > 1) {
                foreach ($it['variants'] as $v) {
                    if (!isset($v['sale_price'], $v['name']) || !is_numeric($v['sale_price'])) continue;
                    $vw = isset($v['weight_kg']) && is_numeric($v['weight_kg']) ? (float)$v['weight_kg'] : $weightKg;
                    $vShip = ($shipPerKg !== null && $vw !== null) ? round($vw * $shipPerKg, 4) : 0.0;
                    $vConv = round((float)$v['sale_price'] * $rate, 4);
                    $vSell = round($vConv + $vShip + round(($vConv + $vShip) * $fee / 100, 4), 4);
                    $variantRows[] = ['name' => trim((string)$v['name']), 'sku' => $v['sku'] ?? null, 'source_price' => (float)$v['sale_price'], 'weight_kg' => $vw, 'selling_usd' => $vSell, 'selling_display' => round($vSell * $rateDisplay, 2)];
                }
                if (count($variantRows) > 1) {
                    $cheapest = collect($variantRows)->sortBy('selling_usd')->first();
                    $selling = $cheapest['selling_usd'];
                    $converted = round($cheapest['source_price'] * $rate, 4);
                    $shipping = $cheapest['weight_kg'] !== null && $shipPerKg !== null ? round($cheapest['weight_kg'] * $shipPerKg, 4) : 0.0;
                    $feeAmount = round($selling - $converted - $shipping, 4);
                } else {
                    $variantRows = [];
                }
            }
            $displayConverted = $converted !== null ? round($converted * $rateDisplay, 2) : null;
            $displayShipping = round($shipping * $rateDisplay, 2);
            $displayFee = $feeAmount !== null ? round($feeAmount * $rateDisplay, 2) : null;
            $displayFinal = $selling !== null ? round($selling * $rateDisplay, 2) : null;

            $products[] = [
                'observed' => [
                    'source_id' => $sourceId,
                    'title' => $title,
                    'title_original' => $it['title'] ?? null,
                    'price_tiers' => $it['price_tiers'] ?? null,
                    'brand' => $it['brand'] ?? null,
                    'category' => $categoryName ?: null,
                    'source_price' => $salePrice,
                    'source_list_price' => isset($it['list_price']) && is_numeric($it['list_price']) ? (float)$it['list_price'] : null,
                    'source_currency' => $it['currency'] ?? null,
                    'rating' => $it['rating'] ?? null,
                    'review_count' => $it['review_count'] ?? null,
                    'product_url' => $it['product_url'] ?? null,
                    'image_urls' => $it['image_urls'] ?? [],
                ],
                'calculated' => [
                    'rate_source_to_usd' => $rate,
                    'converted_price_usd' => $converted,
                    'weight_kg' => $weightKg,
                    'shipping_per_kg_usd' => $shipPerKg,
                    'shipping_usd' => $shipping,
                    'shipping_display' => $displayShipping,
                    'service_fee_percent' => $fee,
                    'service_fee_usd' => $feeAmount,
                    'selling_price_usd' => $selling,
                    'rate_usd_to_display' => $rateDisplay,
                    'display_currency' => $displayCurrency,
                    'converted_price_display' => $displayConverted,
                    'service_fee_display' => $displayFee,
                    'final_price_display' => $displayFinal,
                    'delivery' => $shipPerKg === null ? 'not included, calculated separately' : 'included in the price (weight x USD per kg), before the service fee',
                ],
                'missing_fields' => array_values(array_unique($missing)),
                'errors' => $errors,
                'product_row' => $errors ? null : [
                    'added_by' => 'admin',
                    'user_id' => $admin->id ?? null,
                    'shop_id' => $shop->id ?? null,
                    'name' => $title,
                    'code' => $code,
                    'slug' => $slug,
                    'product_type' => 'physical',
                    'category' => $category ? "existing #{$category->id}" : ($categoryName ? "NEW '$categoryName'" : null),
                    'unit_price' => $selling,
                    'variations' => $variantRows,
                    'purchase_price' => 0,
                    'discount' => 0,
                    'discount_type' => 'flat',
                    'tax' => 0,
                    'tax_type' => 'percent',
                    'tax_model' => 'exclude',
                    'current_stock' => (int)config('trendyol_import.placeholder_stock'),
                    'minimum_order_qty' => $moq,
                    'details' => $details,
                    'images' => [],
                    'thumbnail' => 'def.png',
                    'status' => 0,
                    'request_status' => 1,
                ],
            ];
        }

        $plan = [
            'generated_at' => now()->toDateTimeString(),
            'global' => $global,
            'settings' => ['rate_source_to_usd' => $rate, 'rate_usd_to_display' => $rateDisplay, 'service_fee_percent' => $fee, 'shipping_per_kg_usd' => $shipPerKg, 'source_currency' => $sourceCurrency, 'display_currency' => $displayCurrency, 'base_currency' => 'USD'],
            'formula' => [
                'converted_usd' => 'source_price x rate_source_to_usd',
                'shipping_usd' => $shipPerKg === null ? '0 (delivery separate)' : 'weight_kg x shipping_per_kg_usd',
                'service_fee_usd' => '(converted_usd + shipping_usd) x service_fee_percent / 100',
                'selling_usd (stored as unit_price)' => 'converted_usd + shipping_usd + service_fee_usd',
                'final_display' => 'selling_usd x rate_usd_to_display',
                'delivery' => $shipPerKg === null ? 'separate, not part of the price' : 'included, before the service fee',
            ],
            'new_categories' => array_keys($newCategories),
            'database_changes' => [
                'categories_insert' => count($newCategories),
                'products_insert' => count(array_filter($products, fn($p) => !$p['errors'])),
                'product_seos_insert' => count(array_filter($products, fn($p) => !$p['errors'])),
                'product_import_sources_insert' => count(array_filter($products, fn($p) => !$p['errors'])),
            ],
            'products' => $products,
        ];
        $plan['plan_hash'] = hash('sha256', json_encode([$plan['settings'], $plan['new_categories'], array_map(fn($p) => [$p['observed'], $p['calculated'], $p['product_row']], $products)]));

        return $plan;
    }

    private function printPlan(array $plan): void
    {
        $s = $plan['settings'];
        $this->info("Rates used: 1 {$s['source_currency']} = {$s['rate_source_to_usd']} USD ; 1 USD = {$s['rate_usd_to_display']} {$s['display_currency']} ; service fee {$s['service_fee_percent']}% (fee, not profit margin)");
        foreach ($plan['formula'] as $k => $v) $this->line("  $k = $v");
        $this->info('Observed source price (kept separate) -> converted -> service fee -> final price');
        $rows = [];
        foreach ($plan['products'] as $n => $p) {
            $c = $p['calculated'];
            $rows[] = [
                $n + 1, $p['observed']['source_id'],
                $p['observed']['source_price'] . ' ' . $p['observed']['source_currency'],
                ($c['converted_price_usd'] ?? 'n/a') . ' USD', ($c['shipping_usd'] ?? 0) . ' USD', ($c['service_fee_usd'] ?? 'n/a') . ' USD', ($c['selling_price_usd'] ?? 'n/a') . ' USD',
                ($c['converted_price_display'] ?? 'n/a') . ' ' . $s['display_currency'], ($c['service_fee_display'] ?? 'n/a') . ' ' . $s['display_currency'],
                ($c['final_price_display'] ?? 'n/a') . ' ' . $s['display_currency'], $p['errors'] ? 'ERROR' : 'draft',
            ];
        }
        $this->table(['#', 'source id', 'original (observed)', 'converted', 'shipping', 'fee', 'selling (stored)', 'converted', 'fee', 'FINAL shown', 'result'], $rows);
        foreach ($plan['products'] as $p) {
            $tag = $p['observed']['source_id'];
            foreach ($p['errors'] as $e) $this->error("[$tag] $e");
            if ($p['missing_fields']) $this->warn("[$tag] missing, recorded as missing, NOT invented: " . implode(', ', $p['missing_fields']));
        }
        foreach ($plan['global'] as $g) $this->warn($g);
        $this->line('Exact database changes: ' . json_encode($plan['database_changes']));
        $this->line('New categories: ' . ($plan['new_categories'] ? implode(', ', $plan['new_categories']) : 'none'));
        $this->line('Plan hash: ' . $plan['plan_hash']);
    }

    private function commit(array $plan): int
    {
        foreach ($plan['global'] as $g) {
            if (str_starts_with($g, 'BLOCKER')) {
                $this->error("Refusing to write: $g");
                return self::FAILURE;
            }
        }
        foreach ($plan['products'] as $p) {
            if ($p['errors']) {
                $this->error('Refusing to write: the plan contains products with errors. Fix them first.');
                return self::FAILURE;
            }
        }
        if ($this->option('confirm-plan') !== $plan['plan_hash']) {
            $this->error('Refusing to write: --confirm-plan does not match the current plan hash (' . $plan['plan_hash'] . ').');
            return self::FAILURE;
        }

        $batch = (string)Str::uuid();
        try {
            DB::transaction(function () use ($plan, $batch) {
                $categoryIds = [];
                foreach ($plan['new_categories'] as $name) {
                    // Same values CategoryService::getAddData produces for a new top-level category.
                    $categoryIds[$name] = Category::create([
                        'name' => $name, 'slug' => Str::slug($name), 'icon' => 'def.png', 'icon_storage_type' => null,
                        'parent_id' => 0, 'position' => 0, 'priority' => 0, 'home_status' => 1,
                    ])->id;
                }
                foreach ($plan['products'] as $p) {
                    $row = $p['product_row'];
                    $name = $p['observed']['category'];
                    $brandName = $p['observed']['brand'];
                    $categoryId = $name ? ($categoryIds[$name] ?? Category::where('name', $name)->where('parent_id', 0)->value('id')) : null;
                    $variationJson = json_encode([]); $choiceJson = json_encode([]); $attributesJson = json_encode([]); $stockTotal = $row['current_stock'];
                    if (!empty($row['variations'])) {
                        $attrId = DB::table('attributes')->where('name', 'Option')->value('id') ?: DB::table('attributes')->insertGetId(['name' => 'Option', 'created_at' => now(), 'updated_at' => now()]);
                        $qty = (int)config('trendyol_import.placeholder_stock');
                        $seen = [];
                        foreach ($row['variations'] as $v) {
                            $type = str_replace(' ', '', $v['name']);
                            if (isset($seen[$type])) continue;
                            $seen[$type] = ['type' => $type, 'price' => $v['selling_usd'], 'sku' => $v['sku'] ?? '', 'qty' => $qty];
                        }
                        $variationJson = json_encode(array_values($seen));
                        $choiceJson = json_encode([['name' => 'choice_' . $attrId, 'title' => 'Option', 'options' => array_values(array_map(fn($v) => $v['type'], $seen))]]);
                        $attributesJson = json_encode([(string)$attrId]);
                        $stockTotal = $qty * count($seen);
                    }
                    $product = Product::create([
                        'added_by' => $row['added_by'], 'user_id' => $row['user_id'], 'shop_id' => $row['shop_id'],
                        'name' => $row['name'], 'code' => $row['code'], 'slug' => $row['slug'], 'product_type' => 'physical',
                        'category_ids' => json_encode($categoryId ? [['id' => (string)$categoryId, 'position' => 1]] : []),
                        'category_id' => $categoryId,
                        'brand_id' => $brandName ? DB::table('brands')->whereRaw('LOWER(name) = ?', [mb_strtolower($brandName)])->value('id') : null,
                        'unit_price' => $row['unit_price'], 'purchase_price' => round($row['unit_price'] / (1 + $p['calculated']['service_fee_percent'] / 100), 4),
                        'discount' => 0, 'discount_type' => 'flat', 'tax' => 0, 'tax_type' => 'percent', 'tax_model' => 'exclude',
                        'current_stock' => $stockTotal, 'minimum_order_qty' => $row['minimum_order_qty'], 'details' => $row['details'],
                        'colors' => json_encode([]), 'color_image' => json_encode([]), 'images' => json_encode([]),
                        'choice_options' => $choiceJson, 'variation' => $variationJson, 'attributes' => $attributesJson,
                        'thumbnail' => 'def.png', 'thumbnail_storage_type' => 'public', 'video_provider' => 'youtube',
                        'status' => 0, 'request_status' => 1, 'refundable' => 1,
                    ]);
                    if (!empty($row['variations'])) DB::table('products')->where('id', $product->id)->update(['variant_product' => 1]);
                    // quantity tiers: 1-3 10%, 4-10 8%, 11-20 5%, 21+ ask on WhatsApp (unit_price becomes the first tier)
                    \App\Utils\QuantityPricing::replaceTiers($product->id, \App\Utils\QuantityPricing::DEFAULT_TIERS);
                    DB::table('product_seos')->insert([
                        'product_id' => $product->id, 'title' => null, 'description' => null, 'index' => '', 'no_follow' => '',
                        'no_image_index' => '', 'no_archive' => '', 'no_snippet' => 0, 'max_snippet' => 0, 'max_snippet_value' => 0,
                        'max_video_preview' => 0, 'max_video_preview_value' => 0, 'max_image_preview' => 0,
                        'max_image_preview_value' => 0, 'image' => null, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                    DB::table('product_import_sources')->insert([
                        'batch_id' => $batch, 'source' => $this->source, 'source_id' => $p['observed']['source_id'],
                        'product_id' => $product->id, 'source_url' => $p['observed']['product_url'],
                        'source_price' => $p['observed']['source_price'], 'source_list_price' => $p['observed']['source_list_price'],
                        'source_currency' => $p['observed']['source_currency'], 'exchange_rate' => $p['calculated']['rate_source_to_usd'],
                        'converted_price_usd' => $p['calculated']['converted_price_usd'],
                        'service_fee_percent' => $p['calculated']['service_fee_percent'], 'service_fee_usd' => $p['calculated']['service_fee_usd'],
                        'selling_price' => $p['calculated']['selling_price_usd'], 'usd_to_display_rate' => $p['calculated']['rate_usd_to_display'],
                        'display_currency' => $p['calculated']['display_currency'], 'final_price_display' => $p['calculated']['final_price_display'],
                        'observed_rating' => $p['observed']['rating'], 'observed_review_count' => $p['observed']['review_count'],
                        'source_image_urls' => json_encode($p['observed']['image_urls']), 'missing_fields' => json_encode($p['missing_fields']),
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            });
        } catch (\Throwable $e) {
            $this->error('Write failed and was rolled back: ' . $e->getMessage());
            return self::FAILURE;
        }

        $count = DB::table('product_import_sources')->where('batch_id', $batch)->count();
        $drafts = Product::withoutGlobalScopes()->whereIn('id', DB::table('product_import_sources')->where('batch_id', $batch)->pluck('product_id'))->where('status', 0)->count();
        $this->info("Committed batch $batch: $count ledger rows, $drafts draft products confirmed in the database.");
        $this->line("Undo with: php artisan products:import-trendyol --rollback=$batch --commit");
        return self::SUCCESS;
    }

    private function rollback(string $batch): int
    {
        if (!Schema::hasTable('product_import_sources')) {
            $this->error('Ledger table product_import_sources does not exist.');
            return self::FAILURE;
        }
        $rows = DB::table('product_import_sources')->where('batch_id', $batch)->get();
        if ($rows->isEmpty()) {
            $this->error("No rows for batch $batch.");
            return self::FAILURE;
        }
        $this->table(['product_id', 'source_id', 'selling_price'], $rows->map(fn($r) => [$r->product_id, $r->source_id, $r->selling_price])->all());
        $this->line('Would delete these products, their SEO rows and ledger rows. Categories created by the import are kept.');
        if (!$this->option('commit')) {
            $this->info('DRY RUN: nothing was deleted. Add --commit to roll back.');
            return self::SUCCESS;
        }
        DB::transaction(function () use ($rows, $batch) {
            $ids = $rows->pluck('product_id');
            Product::withoutGlobalScopes()->whereIn('id', $ids)->each(fn($p) => $p->delete());
            DB::table('product_seos')->whereIn('product_id', $ids)->delete();
            DB::table('product_import_sources')->where('batch_id', $batch)->delete();
        });
        $this->info('Rolled back batch ' . $batch . '.');
        return self::SUCCESS;
    }
}
