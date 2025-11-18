<?php
namespace App\Services\Admin;

use App\Models\Admin\Card;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\Admin\CongNo;
use App\Models\Admin\HoaDon;
use App\Models\Admin\HoaDonChiTiet;
use App\Models\Spa\HoaDon as SpaHoaDon;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UserService
{
    static function khachHangInfo($khachHangId)
    {
        // kh info
        $khachHang = User::select(
                'users.*',
                'chi_nhanh.name as chi_nhanh',
                'customer_group.name as customer_group',
                'customer_status.name as customer_status',
                'user_source.name as user_source',
            )
            ->leftJoin('customer_group', 'customer_group.id', 'users.customer_group_id')
            ->leftJoin('customer_status', 'customer_status.id', 'users.customer_status_id')
            ->leftJoin('user_source', 'user_source.id', 'users.user_source_id')
            ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'users.chi_nhanh_id')
            ->find($khachHangId);

        //  lich su mua hang: chỉ nhưng đơn hàng mua, ko bao gồm sử dụng
        $hoaDon = SpaHoaDon::where('khach_hang_id', $khachHangId)->get();
        // gói dv

         // lịch sử sử dụng thẻ
        $history = SpaHoaDon::select(
                'spa_hoa_don.ma_hoa_don',
                'spa_hoa_don.id as hoa_don_id',
                'spa_hoa_don.tong_tien_dich_vu',
                'spa_hoa_don.tong_tien_san_pham',
                'spa_hoa_don.tong_tien',
                'spa_hoa_don.giam_gia as giam_gia',
                'spa_hoa_don.tong_thanh_toan as thanh_toan',
                'spa_hoa_don.created_at as created_at',
            )
            ->where('spa_hoa_don.khach_hang_id',$khachHang->id)
            ->whereNull('spa_hoa_don.deleted_at')
            ->get();

        $tongGiaoDich = SpaHoaDon::where('khach_hang_id',$khachHang->id)
            ->whereNull('deleted_at')
            ->sum('tong_thanh_toan');

        $tongGiamGia = SpaHoaDon::where('khach_hang_id',$khachHang->id)
            ->whereNull('deleted_at')
            ->sum('giam_gia');

        // Spa không có thuế VAT
        $tongVAT = 0;

        // công nợ
        $congNo = CongNo::select(
                'cong_no.*',
                'cong_no.*',
                'products.name as product_name',
                'cong_no_status.name as cong_no_status_name'
            )
            ->where('cong_no.users_id', $khachHangId)
            ->leftJoin('products', 'products.id', 'cong_no.product_id')
            ->leftJoin('hoa_don', 'hoa_don.id', 'cong_no.product_id')
            ->leftJoin('cong_no_status', 'cong_no_status.id', 'cong_no.cong_no_status_id')
            ->orderBy('cong_no.cong_no_status_id', 'desc')
            ->get();

        $goiDV = CardClass::getGoiDV($khachHangId);
         // Thẻ giá trị
        $theGT = CardClass::getTheGT_byUser($khachHangId);

        return [
            'khachHang' => $khachHang,
            'hoaDon' => $hoaDon,
            'congNo' => $congNo,
            'theGT' => $theGT,
            'goiDichVu' => $goiDV,
            'history' => $history,
            'tongGiaoDich' => $tongGiaoDich ?? 0,
            'tongVAT' => $tongVAT ?? 0,
            'tongGiamGia' => $tongGiamGia ?? 0,
        ];
    }

    static function getGoiDichVu($userId) {
        $goiDv = CardClass::getGoiDV($userId);
        $result = [];
        foreach($goiDv as $key => $val) {
            $stt = $key +1;
            $result[] = [
                'stt' => $stt,
                'key' => $val['card']->card_id,
                'id' => $val['card']->card_id,
                'code' => $val['card']->card_code,
                'product_name' => $val['card']->product_name,
                'product_id' => $val['card']->product_id,
                'so_luong' => $val['card']->so_luong,
                'created_at' => $val['card']->created_at,
                'cardService' => $val['cardService'],
            ];
        }
        return $result;
    }
}
