<?php
namespace App\Models\Admin;

use App\Casts\Json;
use App\Services\Admin\TblService;
use Illuminate\Database\Eloquent\Model;

class PhieuChi extends Model
{
    protected $table = 'phieu_chi';
    protected $casts = [
        'info' =>  Json::class,
    ];

    static function savePhieuChi_NhapHang($request, $nhapHang) {
        $phieuChi = new PhieuChi();
        $phieuChi->name = 'Thanh toán trả nợ cho nhà cung cấp';
        $phieuChi->chung_tu_id = $request->chung_tu_id;
        $phieuChi->loai_chung_tu = 'product_nhap_hang';
        $phieuChi->ma_chung_tu = $nhapHang->code;

        $phieuChi->gia_tri_phieu = $request->so_tien;
        $phieuChi->hinh_thuc_chi_id = $request->hinh_thuc_thanh_toan_id;
        $phieuChi->chi_nhanh_id = $nhapHang->chi_nhanh_id;
        $phieuChi->loai_chi_id = 2;  // 2 - nhập hàng từ ncc
        $phieuChi->nha_cung_cap_id = $nhapHang->nha_cung_cap_id;
        $phieuChi->thoi_gian = date('Y-m-d');
        $phieuChi->nhan_vien_id = $request->nhan_vien_id;
        $phieuChi->save();
        
        $phieuChi->code = 'PC' . TblService::formatNumberByLength($phieuChi->id, 5);
        $phieuChi->save();

        return $phieuChi;
    }

    static function savePhieuChi_KhachTraHang($thanhToan, $request, $khachTraHang) {
        $phieuChi = new PhieuChi();
        $phieuChi->name = 'Thanh toán trả nợ cho khách trả hàng';
        $phieuChi->chung_tu_id = $khachTraHang->id;
        $phieuChi->loai_chung_tu = 'product_khach_tra_hang';
        $phieuChi->ma_chung_tu = $khachTraHang->code;
        $phieuChi->chi_nhanh_id = $khachTraHang->chi_nhanh_id;
        $phieuChi->khach_hang_id = $khachTraHang->khach_hang_id;

        $phieuChi->gia_tri_phieu = $thanhToan;
        $phieuChi->hinh_thuc_chi_id = $request->hinh_thuc_thanh_toan_id;
        $phieuChi->loai_chi_id = 3;  // 3 - 'Khách trả hàng',
        $phieuChi->thoi_gian = date('Y-m-d');
        $phieuChi->nhan_vien_id = $khachTraHang->nhan_vien_id;
        $phieuChi->save();
        
        $phieuChi->code = 'PC' . TblService::formatNumberByLength($phieuChi->id, 5);
        $phieuChi->save();

        return $phieuChi;
    }

    static function savePhieuChi_traHangNCC($thanhToan, $hinhThucTT, $traHangNCC) {
        $phieuChi = new PhieuChi();
        $phieuChi->name = 'Thanh toán trả nợ cho khách trả hàng';
        $phieuChi->chung_tu_id = $traHangNCC->id;
        $phieuChi->loai_chung_tu = 'product_tra_hang_ncc';
        $phieuChi->ma_chung_tu = $traHangNCC->code;
        $phieuChi->chi_nhanh_id = $traHangNCC->chi_nhanh_id;
        $phieuChi->nha_cung_cap_id = $traHangNCC->nha_cung_cap_id;

        $phieuChi->gia_tri_phieu = $thanhToan;
        $phieuChi->hinh_thuc_chi_id = $hinhThucTT;
        $phieuChi->loai_chi_id = 3;  // 3 - 'Khách trả hàng',
        $phieuChi->thoi_gian = date('Y-m-d');
        $phieuChi->nhan_vien_id = $traHangNCC->nhan_vien_id;
        $phieuChi->save();
        
        $phieuChi->code = 'PC' . TblService::formatNumberByLength($phieuChi->id, 5);
        $phieuChi->save();

        return $phieuChi;
    }

    static function savePhieuChi_hoaDon($thanhToan, $hinhThucTT, $hoaDon) {
        $phieuChi = new PhieuChi();
        $phieuChi->name = 'Thanh toán trả nợ cho khách trả hàng';
        $phieuChi->chung_tu_id = $hoaDon->id;
        $phieuChi->loai_chung_tu = 'product_tra_hang_ncc';
        $phieuChi->ma_chung_tu = $hoaDon->code;
        $phieuChi->chi_nhanh_id = $hoaDon->chi_nhanh_id;
        $phieuChi->nha_cung_cap_id = $hoaDon->nha_cung_cap_id;

        $phieuChi->gia_tri_phieu = $thanhToan;
        $phieuChi->hinh_thuc_chi_id = $hinhThucTT;
        $phieuChi->loai_chi_id = 3;  // 3 - 'Khách trả hàng',
        $phieuChi->thoi_gian = date('Y-m-d');
        $phieuChi->nhan_vien_id = $hoaDon->nhan_vien_id;
        $phieuChi->save();
        
        $phieuChi->code = 'PC' . TblService::formatNumberByLength($phieuChi->id, 5);
        $phieuChi->save();

        return $phieuChi;
    }
}
