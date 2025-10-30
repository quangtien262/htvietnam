<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class NhaCungCap extends Model
{
    protected $table = 'nha_cung_cap';

    static function getNhaCungCapInfo($id) {
        $info = self::find($id);

        // lịch sử nhập hàng
        $nhapHang = NhapHang::where('nha_cung_cap_id', $id)->get();

        // lịch sử trả hàng
        $traHang = TraHangNCC::where('nha_cung_cap_id', $id)->get();

        // QL cong no
        $congNo = CongNo::where('nha_cung_cap_id', $id)->get();

        return [
            'info' => $info,
            'nhapHang' => $nhapHang,
            'traHang' => $traHang,
            'congNo' => $congNo,
        ];
    }
    
}
