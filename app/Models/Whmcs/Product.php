<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    protected $table = 'whmcs_products';

    protected $fillable = [
        'group_id', 'server_group_id', 'name', 'description', 'type',
        'module', 'package_name', 'config', 'auto_setup', 'status'
    ];

    protected $casts = [
        'config' => 'array',
        'auto_setup' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ProductGroup::class, 'group_id');
    }

    public function serverGroup(): BelongsTo
    {
        return $this->belongsTo(ServerGroup::class);
    }

    public function pricing(): HasMany
    {
        return $this->hasMany(ProductPricing::class);
    }

    // Alias for consistency
    public function pricings(): HasMany
    {
        return $this->pricing();
    }

    public function configurableOptions(): HasMany
    {
        return $this->hasMany(ConfigurableOption::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function taxRules(): BelongsToMany
    {
        return $this->belongsToMany(TaxRule::class, 'whmcs_product_tax', 'product_id', 'tax_rule_id')
            ->withTimestamps();
    }

    public function getPriceForCycle(string $cycle, string $currency = 'VND'): ?ProductPricing
    {
        return $this->pricing()
            ->where('cycle', $cycle)
            ->where('currency', $currency)
            ->first();
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
