<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the separate price-chain columns to the import ledger (original price stays in source_price/source_currency).
 * Existing columns: exchange_rate = source->USD rate, service_fee_percent, selling_price = USD price stored on the product.
 * Run only this file:  php artisan migrate --path=database/migrations/2026_10_24_130000_add_price_breakdown_to_product_import_sources_table.php
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_import_sources', function (Blueprint $table) {
            $table->decimal('converted_price_usd', 14, 4)->nullable()->after('exchange_rate');
            $table->decimal('service_fee_usd', 14, 4)->nullable()->after('service_fee_percent');
            $table->decimal('usd_to_display_rate', 16, 6)->nullable()->after('selling_price');
            $table->string('display_currency', 8)->nullable()->after('usd_to_display_rate');
            $table->decimal('final_price_display', 14, 2)->nullable()->after('display_currency');
        });
    }

    public function down(): void
    {
        Schema::table('product_import_sources', function (Blueprint $table) {
            $table->dropColumn(['converted_price_usd', 'service_fee_usd', 'usd_to_display_rate', 'display_currency', 'final_price_display']);
        });
    }
};
