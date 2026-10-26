<?php

namespace App\Utils;

use App\Models\ProductPriceTier;
use Illuminate\Support\Facades\DB;

/**
 * Quantity pricing: unit price = product cost (products.purchase_price, USD) x (1 + markup of the tier that contains the quantity).
 * Products without tiers (or without a cost) keep their normal unit_price. A tier flagged contact_whatsapp has no online price.
 */
class QuantityPricing
{
    private static array $cache = [];

    /** In single-price mode this many pieces (and fewer) can be bought online at the one price; more = wholesale on WhatsApp. */
    public const RETAIL_MAX = 10;

    /** 'single' (one price + wholesale on WhatsApp, default) or 'tiers' (price table by quantity); business_settings.price_mode */
    public static function mode(): string
    {
        static $mode = null;
        if ($mode === null) {
            $mode = DB::table('business_settings')->where('type', 'price_mode')->value('value') ?: 'single';
        }
        return $mode;
    }

    public static function isSingle(): bool
    {
        return self::mode() === 'single';
    }

    /** Default tiers used for new products: [min_qty, max_qty|null, markup|null, whatsapp] */
    public const DEFAULT_TIERS = [
        [1, 3, 10.0, false],
        [4, 10, 8.0, false],
        [11, 20, 5.0, false],
        [21, null, null, true],
    ];

    public static function tiers(int $productId): array
    {
        if (!array_key_exists($productId, self::$cache)) {
            self::$cache[$productId] = ProductPriceTier::where('product_id', $productId)->orderBy('min_qty')->get()->all();
        }
        return self::$cache[$productId];
    }

    public static function forget(int $productId): void
    {
        unset(self::$cache[$productId]);
    }

    public static function enabled($product): bool
    {
        return (float)($product['purchase_price'] ?? 0) > 0 && count(self::tiers((int)$product['id'])) > 0;
    }

    public static function tierFor($product, int $qty): ?ProductPriceTier
    {
        foreach (self::tiers((int)$product['id']) as $tier) {
            if ($qty >= $tier->min_qty && ($tier->max_qty === null || $qty <= $tier->max_qty)) {
                return $tier;
            }
        }
        return null;
    }

    public static function priceOfTier($product, ProductPriceTier $tier): ?float
    {
        if ($tier->contact_whatsapp || $tier->markup_percent === null) {
            return null;
        }
        return round((float)$product['purchase_price'] * (1 + $tier->markup_percent / 100), 4);
    }

    /** Unit price (USD) for a quantity; $fallback when the product has no tiers; null when the quantity must be negotiated. */
    public static function unitPrice($product, int $qty, $fallback)
    {
        if (self::isSingle()) {
            return $qty > self::RETAIL_MAX ? null : $fallback;
        }
        if (!self::enabled($product)) {
            return $fallback;
        }
        $tier = self::tierFor($product, max(1, $qty));
        return $tier ? self::priceOfTier($product, $tier) : $fallback;
    }

    /**
     * Products with variants: variation.price is the first-tier price of that variant; other tiers scale it by (1 + markup_q) / (1 + markup_first).
     * null = ask on WhatsApp.
     */
    public static function adjustVariant($product, int $qty, $variantPrice)
    {
        if (self::isSingle()) {
            return $qty > self::RETAIL_MAX ? null : $variantPrice;
        }
        if (!self::enabled($product)) {
            return $variantPrice;
        }
        $tiers = self::tiers((int)$product['id']);
        $first = null;
        foreach ($tiers as $t) { if (!$t->contact_whatsapp && $t->markup_percent !== null) { $first = $t; break; } }
        $tier = self::tierFor($product, max(1, $qty));
        if ($tier === null || $first === null) {
            return $variantPrice;
        }
        if ($tier->contact_whatsapp || $tier->markup_percent === null) {
            return null;
        }
        return round((float)$variantPrice * (1 + $tier->markup_percent / 100) / (1 + $first->markup_percent / 100), 4);
    }

    /** true when this quantity is only sold after talking on WhatsApp */
    public static function needsWhatsapp($product, int $qty): bool
    {
        if (self::isSingle()) {
            return $qty > self::RETAIL_MAX;
        }
        if (!self::enabled($product)) {
            return false;
        }
        $tier = self::tierFor($product, max(1, $qty));
        return $tier !== null && self::priceOfTier($product, $tier) === null;
    }

    /** Price shown on lists/cards: the first tier (smallest quantity) */
    public static function firstPrice($product)
    {
        $tiers = self::tiers((int)$product['id']);
        if ((float)($product['purchase_price'] ?? 0) > 0 && $tiers) {
            return self::priceOfTier($product, $tiers[0]) ?? $product['unit_price'];
        }
        return $product['unit_price'];
    }

    /** Reads the "price_tiers" rows of the admin product form (min / max / markup / whatsapp) and stores them. */
    public static function syncFromRequest(int $productId, $request): void
    {
        if (!$request->has('price_tiers')) {
            return;
        }
        $tiers = [];
        foreach ((array)$request->input('price_tiers') as $row) {
            $min = (int)($row['min'] ?? 0);
            if ($min < 1) {
                continue;
            }
            $whatsapp = !empty($row['whatsapp']);
            $max = isset($row['max']) && $row['max'] !== '' ? (int)$row['max'] : null;
            $markup = $whatsapp ? null : (float)($row['markup'] ?? 0);
            $tiers[] = [$min, $max, $markup, $whatsapp];
        }
        usort($tiers, fn($a, $b) => $a[0] <=> $b[0]);
        self::replaceTiers($productId, $tiers);
    }

    /** Replaces the tiers of a product and keeps unit_price = price of the first tier. */
    public static function replaceTiers(int $productId, array $tiers): void
    {
        DB::transaction(function () use ($productId, $tiers) {
            ProductPriceTier::where('product_id', $productId)->delete();
            foreach ($tiers as $t) {
                ProductPriceTier::create([
                    'product_id' => $productId, 'min_qty' => $t[0], 'max_qty' => $t[1],
                    'markup_percent' => $t[3] ? null : $t[2], 'contact_whatsapp' => (bool)$t[3],
                ]);
            }
            $row = DB::table('products')->where('id', $productId)->first(['purchase_price']);
            $first = collect($tiers)->first(fn($t) => !$t[3]);
            if ($row && $row->purchase_price > 0 && $first) {
                DB::table('products')->where('id', $productId)->update(['unit_price' => round($row->purchase_price * (1 + $first[2] / 100), 4)]);
            }
        });
        self::forget($productId);
    }
}
