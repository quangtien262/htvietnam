<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TaxRule extends Model
{
    protected $table = 'whmcs_tax_rules';

    protected $fillable = [
        'name',
        'rate',
        'type',
        'country',
        'state',
        'compound',
        'priority',
        'is_active',
        'description',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'compound' => 'boolean',
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    /**
     * Products using this tax rule
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'whmcs_product_tax', 'tax_rule_id', 'product_id')
            ->withTimestamps();
    }

    /**
     * Check if tax rule is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if tax is compound
     */
    public function isCompound(): bool
    {
        return $this->compound;
    }

    /**
     * Calculate tax amount
     */
    public function calculateTax(float $amount, float $previousTax = 0): float
    {
        if ($this->type === 'fixed') {
            return $this->rate;
        }

        // For compound tax, calculate on amount + previous tax
        $baseAmount = $this->compound ? ($amount + $previousTax) : $amount;
        
        return ($baseAmount * $this->rate) / 100;
    }

    /**
     * Get formatted rate
     */
    public function getFormattedRateAttribute(): string
    {
        if ($this->type === 'fixed') {
            return '$' . number_format($this->rate, 2);
        }
        
        return number_format($this->rate, 2) . '%';
    }

    /**
     * Scope: Active tax rules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: By country
     */
    public function scopeByCountry($query, string $country)
    {
        return $query->where(function ($q) use ($country) {
            $q->where('country', $country)
              ->orWhereNull('country');
        });
    }

    /**
     * Scope: By location
     */
    public function scopeByLocation($query, string $country, ?string $state = null)
    {
        return $query->where(function ($q) use ($country, $state) {
            $q->where('country', $country);
            
            if ($state) {
                $q->where(function ($sq) use ($state) {
                    $sq->where('state', $state)
                       ->orWhereNull('state');
                });
            }
        })->orWhereNull('country');
    }

    /**
     * Get applicable tax rules for location
     */
    public static function getApplicableRules(string $country, ?string $state = null)
    {
        return static::active()
            ->byLocation($country, $state)
            ->orderBy('priority')
            ->get();
    }
}
