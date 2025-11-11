<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsTaxRule extends Model
{
    protected $table = 'whmcs_tax_rules';

    protected $fillable = [
        'name',
        'country',
        'state',
        'rate',
        'compound',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'compound' => 'boolean',
        'is_active' => 'boolean',
    ];
}
