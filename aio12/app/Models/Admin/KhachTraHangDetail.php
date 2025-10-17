<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class KhachTraHangDetail extends Model
{
    protected $table = 'product_khach_tra_hang_detail';

    static function baseQuery()
    {
        return self::where('is_recycle_bin', '!=', 1)->where('is_draft', 0);
    }    
}
