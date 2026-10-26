<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ledger for imported products: keeps the ORIGINAL source price/currency separate from the selling price,
 * guards against duplicate imports and lets a whole batch be rolled back.
 * Run only this file:  php artisan migrate --path=database/migrations/2026_10_24_120000_create_product_import_sources_table.php
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_import_sources', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->index();
            $table->string('source', 30);
            $table->string('source_id', 64);
            $table->unsignedBigInteger('product_id')->index();
            $table->string('source_url', 500)->nullable();
            $table->decimal('source_price', 12, 2)->nullable();
            $table->decimal('source_list_price', 12, 2)->nullable();
            $table->string('source_currency', 8)->nullable();
            $table->decimal('exchange_rate', 16, 6);
            $table->decimal('service_fee_percent', 6, 2);
            $table->decimal('selling_price', 12, 2);
            $table->decimal('observed_rating', 3, 1)->nullable();
            $table->unsignedInteger('observed_review_count')->nullable();
            $table->json('source_image_urls')->nullable();
            $table->json('missing_fields')->nullable();
            $table->timestamps();
            $table->unique(['source', 'source_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_import_sources');
    }
};
