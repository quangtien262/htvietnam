<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsActivityLog extends Model
{
    protected $table = 'whmcs_activity_logs';

    protected $fillable = [
        'user_id',
        'client_id',
        'action',
        'entity_type',
        'entity_id',
        'description',
        'data',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'data' => 'array',
    ];
}
