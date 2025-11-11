<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsServiceFieldValue extends Model
{
    protected $table = 'whmcs_service_field_values';

    protected $fillable = [
        'service_id',
        'field_id',
        'value',
    ];
}
