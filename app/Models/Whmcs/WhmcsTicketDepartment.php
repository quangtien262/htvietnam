<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsTicketDepartment extends Model
{
    protected $table = 'whmcs_ticket_departments';

    protected $fillable = [
        'name',
        'description',
        'email',
        'assigned_staff_ids',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'assigned_staff_ids' => 'array',
        'is_active' => 'boolean',
    ];
}
