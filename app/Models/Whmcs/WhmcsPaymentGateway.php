<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsPaymentGateway extends Model
{
    protected $table = 'whmcs_payment_gateways';

    protected $fillable = [
        'gateway_name',
        'display_name',
        'description',
        'config',
        'is_active',
        'visible_to_clients',
        'fee_percentage',
        'fee_fixed',
        'sort_order',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'visible_to_clients' => 'boolean',
        'fee_percentage' => 'decimal:2',
        'fee_fixed' => 'decimal:2',
    ];
}
