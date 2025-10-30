<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class KiemKhoDetail extends Model
{
    protected $table = 'product_kiem_kho_detail';

    static function baseQuery()
    {
        return self::where('is_recycle_bin', '!=', 1)->where('is_draft', 0);
    }   
    
}
