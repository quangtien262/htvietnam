<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class TraHangNCC extends Model
{
    protected $table = 'product_tra_hang_ncc';
    protected $casts = [
        'sub_data_ids' =>  Json::class,
        'info' =>  Json::class,
    ];

    
}
