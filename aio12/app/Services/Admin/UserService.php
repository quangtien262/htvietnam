<?php
namespace App\Services\Admin;

use App\Models\Admin\Card;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\Admin\CongNo;
use App\Models\Admin\HoaDon;
use App\Models\Admin\HoaDonChiTiet;
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
        $hoaDon = HoaDon::where('users_id', $khachHangId)->get();
        // gói dv

         // lịch sử sử dụng thẻ
        $history = HoaDon::select(
                'hoa_don.code',
                'hoa_don.id as hoa_don_id',

                'hoa_don.TongTienHang as TongTienHang',
                'hoa_don.TongChietKhau as TongChietKhau',
                'hoa_don.TongTienThue as TongTienThue',
                'hoa_don.giam_gia as giam_gia',
                'hoa_don.cong_no as cong_no',
                'hoa_don.thanh_toan as thanh_toan',
                'hoa_don.created_at as created_at',
            )
            ->where('hoa_don.users_id',$khachHang->id)
            ->where('hoa_don.is_draft',0)
            ->where('hoa_don.is_recycle_bin',0)
            ->get();

        $tongGiaoDich = HoaDon::select(
                'hoa_don.code',
                'hoa_don.id as hoa_don_id',

                'hoa_don.TongTienHang as TongTienHang',
                'hoa_don.TongChietKhau as TongChietKhau',
                'hoa_don.TongTienThue as TongTienThue',
                'hoa_don.giam_gia as giam_gia',
                'hoa_don.cong_no as cong_no',
                'hoa_don.thanh_toan as thanh_toan',
                'hoa_don.created_at as created_at',
            )
            ->where('hoa_don.users_id',$khachHang->id)
            ->where('hoa_don.is_draft',0)
            ->where('hoa_don.is_recycle_bin',0)
            ->sum('thanh_toan');

        $tongGiamGia = HoaDon::select(
                'hoa_don.code',
                'hoa_don.id as hoa_don_id',

                'hoa_don.TongTienHang as TongTienHang',
                'hoa_don.TongChietKhau as TongChietKhau',
                'hoa_don.TongTienThue as TongTienThue',
                'hoa_don.giam_gia as giam_gia',
                'hoa_don.cong_no as cong_no',
                'hoa_don.thanh_toan as thanh_toan',
                'hoa_don.created_at as created_at',
            )
            ->where('hoa_don.users_id',$khachHang->id)
            ->where('hoa_don.is_draft',0)
            ->where('hoa_don.is_recycle_bin',0)
            ->sum('giam_gia');

        $tongVAT = HoaDon::select(
                'hoa_don.code',
                'hoa_don.id as hoa_don_id',

                'hoa_don.TongTienHang as TongTienHang',
                'hoa_don.TongChietKhau as TongChietKhau',
                'hoa_don.TongTienThue as TongTienThue',
                'hoa_don.giam_gia as giam_gia',
                'hoa_don.cong_no as cong_no',
                'hoa_don.thanh_toan as thanh_toan',
                'hoa_don.created_at as created_at',
            )
            ->where('hoa_don.users_id',$khachHang->id)
            ->where('hoa_don.is_draft',0)
            ->where('hoa_don.is_recycle_bin',0)
            ->sum('TongTienThue');

        // công nợ
        $congNo = CongNo::select(
                'cong_no.*',
                'cong_no.*',
                'product.name as product_name',
                'cong_no_status.name as cong_no_status_name'
            )
            ->where('cong_no.users_id', $khachHangId)
            ->leftJoin('product', 'product.id', 'cong_no.product_id')
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
            'tongGiaoDich' => $tongGiaoDich,
            'tongVAT' => $tongVAT,
            'tongGiamGia' => $tongGiamGia,
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
