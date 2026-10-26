<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Quantity based pricing: products.purchase_price holds the cost (source price + delivery, USD) and each product
     * gets tiers "from qty - to qty - markup %". A tier with contact_whatsapp = 1 has no price (ask on WhatsApp).
     */
    public function up(): void
    {
        Schema::create('product_price_tiers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedInteger('min_qty');
            $table->unsignedInteger('max_qty')->nullable();
            $table->decimal('markup_percent', 6, 2)->nullable();
            $table->boolean('contact_whatsapp')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_price_tiers');
    }
};
