<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsProductPricing extends Model
{
    protected $table = 'whmcs_product_pricing';

    protected $fillable = [
        'product_id',
        'currency_code',
        'setup_fee',
        'price_onetime',
        'price_monthly',
        'price_quarterly',
        'price_semiannually',
        'price_annually',
        'price_biennially',
        'price_triennially',
    ];

    protected $casts = [
        'setup_fee' => 'decimal:2',
        'price_onetime' => 'decimal:2',
        'price_monthly' => 'decimal:2',
        'price_quarterly' => 'decimal:2',
        'price_semiannually' => 'decimal:2',
        'price_annually' => 'decimal:2',
        'price_biennially' => 'decimal:2',
        'price_triennially' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(WhmcsProduct::class, 'product_id');
    }

    public function getPriceForBillingCycle(string $cycle): ?float
    {
        return match ($cycle) {
            'onetime' => $this->price_onetime,
            'monthly' => $this->price_monthly,
            'quarterly' => $this->price_quarterly,
            'semiannually' => $this->price_semiannually,
            'annually' => $this->price_annually,
            'biennially' => $this->price_biennially,
            'triennially' => $this->price_triennially,
            default => null,
        };
    }
}
