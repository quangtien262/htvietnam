<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class XuatHuy extends Model
{
    protected $table = 'product_xuat_huy';
    protected $casts = [
        'sub_data_ids' =>  Json::class,
        'info' =>  Json::class,
    ];

    static function baseQuery()
    {
        return self::where('is_recycle_bin', '!=', 1)->where('is_draft', 0);
    }

    
}
