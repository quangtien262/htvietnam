<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class NhapHang extends Model
{
    protected $table = 'product_nhap_hang';
    protected $casts = [
        'sub_data_ids' =>  Json::class,
        'info' =>  Json::class,
    ];

    
}
