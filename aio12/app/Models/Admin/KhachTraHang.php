<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class KhachTraHang extends Model
{
    protected $table = 'product_khach_tra_hang';
    protected $casts = [
        'sub_data_ids' =>  Json::class,
        'info' =>  Json::class,
    ];

    
}
