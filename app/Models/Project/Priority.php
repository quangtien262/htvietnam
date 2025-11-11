<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class Priority extends Model
{
    protected $table = 'pro___priorities';

    protected $fillable = [
        'ten_uu_tien',
        'cap_do',
        'ma_mau',
    ];

    protected $casts = [
        'cap_do' => 'integer',
    ];
}
