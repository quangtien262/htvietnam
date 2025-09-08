<?php

namespace App\Models\Web;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class Emails extends Model
{
    protected $table = 'emails';
    protected $casts = [
        'country_id' => Json::class,
    ];
}
