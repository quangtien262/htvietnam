<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsProductAddon extends Model
{
    protected $table = 'whmcs_product_addons';

    protected $fillable = [
        'name',
        'description',
        'welcome_email',
        'applicable_product_ids',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'applicable_product_ids' => 'array',
        'is_active' => 'boolean',
    ];
}
