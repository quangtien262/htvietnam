<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class NhapHangDetail extends Model
{
    protected $table = 'product_nhap_hang_detail';

    static function baseQuery()
    {
        return self::where('is_recycle_bin', '!=', 1)->where('is_draft', 0);
    }
}
