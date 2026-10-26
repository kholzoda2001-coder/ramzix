<?php

namespace App\Console\Commands;

use App\Utils\QuantityPricing;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Gives every imported product its cost (purchase_price) and the default quantity tiers (1-3: 10%, 4-10: 8%, 11-20: 5%, 21+: WhatsApp).
 * cost = the stored selling price taken back out of the service fee that the importer added: selling / (1 + fee/100).
 * Dry run by default.
 */
class SeedPriceTiers extends Command
{
    protected $signature = 'products:seed-price-tiers {--commit : Write the cost, the tiers and the new unit_price}';

    protected $description = 'Set cost price and default quantity price tiers for all imported products';

    public function handle(): int
    {
        $rows = DB::table('product_import_sources')->join('products', 'products.id', '=', 'product_import_sources.product_id')
            ->select('products.id', 'products.name', 'products.unit_price', 'products.purchase_price', 'product_import_sources.selling_price', 'product_import_sources.service_fee_percent')
            ->orderBy('products.id')->get();
        $first = QuantityPricing::DEFAULT_TIERS[0][2];
        $changes = [];
        foreach ($rows as $r) {
            if ((float)$r->selling_price <= 0) {
                $this->warn("#{$r->id} skipped: no selling price in the ledger");
                continue;
            }
            $cost = round($r->selling_price / (1 + $r->service_fee_percent / 100), 4);
            $changes[] = ['id' => $r->id, 'cost' => $cost, 'old' => (float)$r->unit_price, 'new' => round($cost * (1 + $first / 100), 4)];
        }
        foreach (array_slice($changes, 0, 5) as $c) $this->line("#{$c['id']}: cost {$c['cost']} USD, unit_price {$c['old']} -> {$c['new']}");
        $this->line(count($changes) . ' products; tiers: ' . json_encode(QuantityPricing::DEFAULT_TIERS));
        if (!$this->option('commit')) {
            $this->info('DRY RUN: nothing written.');
            return self::SUCCESS;
        }
        DB::transaction(function () use ($changes) {
            foreach ($changes as $c) {
                DB::table('products')->where('id', $c['id'])->update(['purchase_price' => $c['cost']]);
                QuantityPricing::replaceTiers($c['id'], QuantityPricing::DEFAULT_TIERS);
            }
        });
        $this->info('Done: ' . count($changes) . ' products now have cost, tiers and unit_price = first tier.');
        return self::SUCCESS;
    }
}
