<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    protected $table = 'whmcs_currencies';

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'format',
        'exchange_rate',
        'is_base',
        'is_active',
        'decimal_places',
        'position',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:6',
        'is_base' => 'boolean',
        'is_active' => 'boolean',
        'decimal_places' => 'integer',
    ];

    /**
     * Get invoices in this currency
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'currency_id');
    }

    /**
     * Get services in this currency
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'currency_id');
    }

    /**
     * Get transactions in this currency
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'currency_id');
    }

    /**
     * Check if this is the base currency
     */
    public function isBase(): bool
    {
        return $this->is_base;
    }

    /**
     * Check if this currency is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Format amount with currency symbol
     */
    public function formatAmount(float $amount): string
    {
        $formattedAmount = number_format($amount, $this->decimal_places);
        
        return str_replace(
            ['{symbol}', '{amount}'],
            [$this->symbol, $formattedAmount],
            $this->format
        );
    }

    /**
     * Convert amount from this currency to base currency
     */
    public function toBase(float $amount): float
    {
        if ($this->is_base) {
            return $amount;
        }
        
        return $amount / $this->exchange_rate;
    }

    /**
     * Convert amount from base currency to this currency
     */
    public function fromBase(float $amount): float
    {
        if ($this->is_base) {
            return $amount;
        }
        
        return $amount * $this->exchange_rate;
    }

    /**
     * Convert amount to another currency
     */
    public function convertTo(float $amount, Currency $targetCurrency): float
    {
        // Convert to base first, then to target
        $baseAmount = $this->toBase($amount);
        return $targetCurrency->fromBase($baseAmount);
    }

    /**
     * Scope: Get only active currencies
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get base currency
     */
    public function scopeBase($query)
    {
        return $query->where('is_base', true);
    }

    /**
     * Get the base currency
     */
    public static function getBase(): ?Currency
    {
        return static::base()->first();
    }

    /**
     * Get currency by code
     */
    public static function getByCode(string $code): ?Currency
    {
        return static::where('code', $code)->first();
    }
}
