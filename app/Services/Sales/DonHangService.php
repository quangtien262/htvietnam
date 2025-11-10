<?php

namespace App\Services\Sales;

use App\Models\Sales\DonHang;
use App\Models\Sales\DonHangChiTiet;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DonHangService
{
    public function tinhTongDonHang($donHangId)
    {
        $donHang = DonHang::with('chiTiets')->findOrFail($donHangId);

        $tongTienHang = $donHang->chiTiets->sum('thanh_tien');
        $tienVat = $tongTienHang * 0.1; // 10% VAT
        $tongCong = $tongTienHang - $donHang->tien_giam_gia + $tienVat + $donHang->phi_van_chuyen;

        $donHang->update([
            'tong_tien_hang' => $tongTienHang,
            'tien_vat' => $tienVat,
            'tong_cong' => $tongCong,
            'con_no' => $tongCong - $donHang->da_thanh_toan,
        ]);

        return $donHang;
    }

    public function capNhatCongNoKhachHang($userId)
    {
        $tongNo = DonHang::where('user_id', $userId)
            ->sum('con_no');

        User::where('id', $userId)->update([
            'cong_no_hien_tai' => $tongNo
        ]);
    }
}
