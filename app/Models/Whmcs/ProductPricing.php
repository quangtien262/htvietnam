<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPricing extends Model
{
    use HasFactory;

    protected $table = 'whmcs_product_pricing';

    protected $fillable = [
        'product_id', 'cycle', 'currency', 'setup_fee', 'price'
    ];

    protected $casts = [
        'setup_fee' => 'decimal:2',
        'price' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getTotalPrice(): float
    {
        return (float) ($this->setup_fee + $this->price);
    }
}
