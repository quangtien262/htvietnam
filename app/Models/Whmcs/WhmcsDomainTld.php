<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhmcsDomainTld extends Model
{
    protected $table = 'whmcs_domain_tlds';

    protected $fillable = [
        'tld',
        'price_register',
        'price_transfer',
        'price_renew',
        'currency_code',
        'auto_register',
        'registrar',
        'epp_code_required',
        'grace_period',
        'redemption_period',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_register' => 'decimal:2',
        'price_transfer' => 'decimal:2',
        'price_renew' => 'decimal:2',
        'auto_register' => 'boolean',
        'epp_code_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function domains(): HasMany
    {
        return $this->hasMany(WhmcsDomain::class, 'tld_id');
    }
}
