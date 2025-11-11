<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsCurrency extends Model
{
    protected $table = 'whmcs_currencies';

    protected $fillable = [
        'code',
        'prefix',
        'suffix',
        'format',
        'rate',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'rate' => 'decimal:6',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];
}
