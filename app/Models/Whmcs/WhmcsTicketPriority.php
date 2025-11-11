<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsTicketPriority extends Model
{
    protected $table = 'whmcs_ticket_priorities';

    protected $fillable = [
        'name',
        'color',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
