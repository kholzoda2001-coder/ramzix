<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $product_id
 * @property int $min_qty
 * @property int|null $max_qty
 * @property float|null $markup_percent
 * @property bool $contact_whatsapp
 */
class ProductPriceTier extends Model
{
    protected $fillable = ['product_id', 'min_qty', 'max_qty', 'markup_percent', 'contact_whatsapp'];

    protected $casts = [
        'product_id' => 'integer',
        'min_qty' => 'integer',
        'max_qty' => 'integer',
        'markup_percent' => 'float',
        'contact_whatsapp' => 'boolean',
    ];
}
