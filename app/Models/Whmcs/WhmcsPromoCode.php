<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsPromoCode extends Model
{
    protected $table = 'whmcs_promo_codes';

    protected $fillable = [
        'code',
        'type',
        'value',
        'recurring',
        'applicable_product_ids',
        'applicable_billing_cycles',
        'max_uses',
        'current_uses',
        'start_date',
        'expiry_date',
        'minimum_order_amount',
        'new_clients_only',
        'existing_clients_only',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'recurring' => 'boolean',
        'applicable_product_ids' => 'array',
        'applicable_billing_cycles' => 'array',
        'start_date' => 'date',
        'expiry_date' => 'date',
        'minimum_order_amount' => 'decimal:2',
        'new_clients_only' => 'boolean',
        'existing_clients_only' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->max_uses && $this->current_uses >= $this->max_uses) return false;
        if ($this->start_date && $this->start_date->isFuture()) return false;
        if ($this->expiry_date && $this->expiry_date->isPast()) return false;
        return true;
    }

    public function incrementUses(): void
    {
        $this->increment('current_uses');
    }
}
