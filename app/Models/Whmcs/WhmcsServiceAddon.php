<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsServiceAddon extends Model
{
    protected $table = 'whmcs_service_addons';

    protected $fillable = [
        'service_id',
        'addon_id',
        'addon_name',
        'billing_cycle',
        'recurring_amount',
        'registration_date',
        'next_due_date',
        'termination_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'recurring_amount' => 'decimal:2',
        'registration_date' => 'date',
        'next_due_date' => 'date',
        'termination_date' => 'date',
    ];
}
