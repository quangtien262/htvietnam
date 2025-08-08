<?php
namespace App\Models\Admin;

use App\Casts\Json;
use App\Services\Admin\TblService;
use Illuminate\Database\Eloquent\Model;

class SoQuy extends Model
{
    protected $table = 'so_quy';

    static function saveSoQuy_NhapHang($soTien, $nhapHang) {
        $now =date('d/m/Y H:i:s');
        $nowDB =date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Thanh toán trả nợ cho nhà cung cấp (Nhập hàng)';
        $soQuy->loai_chung_tu = 'product_nhap_hang';
        $soQuy->chung_tu_id = $nhapHang->id;
        $soQuy->ma_chung_tu = $nhapHang->code;
        $soQuy->chi_nhanh_id = $nhapHang->chi_nhanh_id;
        // $soQuy->khach_hang_id = $rq->khach_hang_id;
        $soQuy->nha_cung_cap_id = $nhapHang->nha_cung_cap_id;
        $soQuy->nhan_vien_id = $nhapHang->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.chi_tien_ncc');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.ncc'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
    }

    static function saveSoQuy_KhachTraHang($soTien, $khachTraHang) {
        $nowDB =date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Thanh toán trả nợ cho khách hàng (Trả hàng)';
        $soQuy->loai_chung_tu = 'product_khach_tra_hang';
        $soQuy->chung_tu_id = $khachTraHang->id;
        $soQuy->ma_chung_tu = $khachTraHang->code;
        $soQuy->chi_nhanh_id = $khachTraHang->chi_nhanh_id;
        
        $soQuy->khach_hang_id = $khachTraHang->khach_hang_id;

        $soQuy->nhan_vien_id = $khachTraHang->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.khach_tra_hang');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.khach_hang'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
        return $soQuy;
    }

    static function saveSoQuy_TraHangNCC($soTien, $traHangNCC) {
        $nowDB =date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Thanh toán thu nợ cho nhà cung cấp (Trả hàng)';
        $soQuy->loai_chung_tu = 'product_tra_hang_ncc';
        $soQuy->chung_tu_id = $traHangNCC->id;
        $soQuy->ma_chung_tu = $traHangNCC->code;
        $soQuy->chi_nhanh_id = $traHangNCC->chi_nhanh_id;
        
        $soQuy->khach_hang_id = $traHangNCC->khach_hang_id;

        $soQuy->nhan_vien_id = $traHangNCC->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.thu_tien_ncc');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.cty'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
        return $soQuy;
    }

    static function saveSoQuy_hoaDon($soTien, $hoaDon) {
        $nowDB =date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Khách thanh toán công nợ (Hóa đơn bán lẻ)';
        $soQuy->loai_chung_tu = 'hoa_don';
        $soQuy->chung_tu_id = $hoaDon->id;
        $soQuy->ma_chung_tu = $hoaDon->code;
        $soQuy->chi_nhanh_id = $hoaDon->chi_nhanh_id;
        
        $soQuy->khach_hang_id = $hoaDon->khach_hang_id;

        $soQuy->nhan_vien_id = $hoaDon->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.khach_tt_hdon');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.cty'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
        return $soQuy;
    }
}
