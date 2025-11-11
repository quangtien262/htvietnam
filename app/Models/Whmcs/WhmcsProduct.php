<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsProduct extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_products';

    protected $fillable = [
        'group_id',
        'type',
        'name',
        'slug',
        'description',
        'welcome_email',
        'stock_control',
        'stock_quantity',
        'pay_type_free',
        'pay_type_onetime',
        'pay_type_recurring',
        'auto_setup',
        'module_name',
        'module_config',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'stock_control' => 'boolean',
        'pay_type_free' => 'boolean',
        'pay_type_onetime' => 'boolean',
        'pay_type_recurring' => 'boolean',
        'module_config' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    // Relationships
    public function group(): BelongsTo
    {
        return $this->belongsTo(WhmcsProductGroup::class, 'group_id');
    }

    public function pricing(): HasMany
    {
        return $this->hasMany(WhmcsProductPricing::class, 'product_id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(WhmcsProductField::class, 'product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(WhmcsOrderItem::class, 'product_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(WhmcsService::class, 'product_id');
    }

    // Helper Methods
    public function getPricing(string $currencyCode = 'VND')
    {
        return $this->pricing()->where('currency_code', $currencyCode)->first();
    }

    public function hasStock(): bool
    {
        if (!$this->stock_control) {
            return true;
        }
        return $this->stock_quantity > 0;
    }

    public function decrementStock(int $quantity = 1): void
    {
        if ($this->stock_control) {
            $this->decrement('stock_quantity', $quantity);
        }
    }

    public function incrementStock(int $quantity = 1): void
    {
        if ($this->stock_control) {
            $this->increment('stock_quantity', $quantity);
        }
    }
}
