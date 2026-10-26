<?php

/*
 * Settings for the Trendyol product import (php artisan products:import-trendyol).
 *
 * Neither exchange rate has a built-in value: both must be supplied explicitly (env or CLI option).
 * An estimated or outdated rate must never be used as if it were the real one.
 *
 * Price chain (all rates and the fee are parameters):
 *   price_usd   = source_price x RATE_SOURCE_TO_USD            (6Valley stores prices in its base currency, USD)
 *   fee_usd     = price_usd x SERVICE_FEE_PERCENT / 100         (service fee, NOT profit margin)
 *   selling_usd = price_usd + fee_usd                           (stored as products.unit_price)
 *   final_tjs   = selling_usd x RATE_USD_TO_DISPLAY             (what a customer sees when TJS is selected)
 * Delivery is NOT part of this chain; it is calculated separately.
 */
return [
    // Per-run limit (raised from 5 to 25 for the Anker batches; each run still needs its own plan hash).
    'max_products' => (int)env('TRENDYOL_IMPORT_MAX_PRODUCTS', 25),

    'source_currency' => env('TRENDYOL_IMPORT_SOURCE_CURRENCY', 'AED'),
    'display_currency' => env('TRENDYOL_IMPORT_DISPLAY_CURRENCY', 'TJS'),

    // 1 source-currency unit expressed in USD (no default).
    'rate_source_to_usd' => env('TRENDYOL_IMPORT_RATE_AED_USD'),

    // 1 USD expressed in the display currency (no default). Must equal the exchange_rate of that currency in 6Valley.
    'rate_usd_to_display' => env('TRENDYOL_IMPORT_RATE_USD_TJS'),

    // Service fee percent, kept at 10 unless changed here / with --fee.
    'service_fee_percent' => env('TRENDYOL_IMPORT_SERVICE_FEE', 10),

    // Delivery is calculated separately: the source gives no delivery cost, so none is written.
    'include_delivery_in_price' => false,

    // The source has no stock data; placeholder, flagged as "stock unknown".
    'placeholder_stock' => 0,

    // Images: the shop owner confirmed with Trendyol support that re-use is allowed (keep that confirmation in writing).
    // Handled by products:import-trendyol-images, not by the main import.
    'images_permitted' => true,

    // Availability sync (products:check-availability).
    'available_stock' => (int)env('TRENDYOL_IMPORT_AVAILABLE_STOCK', 5),
    'check_delay_seconds' => (int)env('TRENDYOL_IMPORT_CHECK_DELAY', 4),
    // Automatic run every 4 hours via the Laravel scheduler (needs cron / Task Scheduler running schedule:run).
    'availability_schedule' => (bool)env('TRENDYOL_IMPORT_AVAILABILITY_SCHEDULE', false),
];
