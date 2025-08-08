<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;

class Log extends Model
{
    use HasFactory;

    protected $table = 'log';

    protected $casts = [
        'data_new' => Json::class,
        'data_old' => Json::class,
    ];
}
