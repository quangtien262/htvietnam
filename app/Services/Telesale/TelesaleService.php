<?php

namespace App\Services\Telesale;

use App\Models\Telesale\{DataKhachHangTelesale, CuocGoiTelesale, DonHangTelesale, KpiTelesale};
use Illuminate\Support\Facades\DB;

class TelesaleService
{
    // Phân bổ data cho telesale
    public function phanBoData($dataIds, $nhanVienId)
    {
        DataKhachHangTelesale::whereIn('id', $dataIds)
            ->update(['nhan_vien_telesale_id' => $nhanVienId]);
            
        return true;
    }

    // Cập nhật KPI tháng
    public function capNhatKPI($nhanVienId, $thang, $nam)
    {
        $kpi = KpiTelesale::firstOrCreate(
            ['nhan_vien_telesale_id' => $nhanVienId, 'thang' => $thang, 'nam' => $nam]
        );

        // Thực tế cuộc gọi
        $thucTeCuocGoi = CuocGoiTelesale::where('nhan_vien_telesale_id', $nhanVienId)
            ->whereMonth('thoi_gian_bat_dau', $thang)
            ->whereYear('thoi_gian_bat_dau', $nam)
            ->count();

        // Thực tế đơn hàng
        $thucTeDonHang = DonHangTelesale::where('nhan_vien_telesale_id', $nhanVienId)
            ->whereMonth('ngay_dat_hang', $thang)
            ->whereYear('ngay_dat_hang', $nam)
            ->count();

        // Thực tế doanh thu
        $thucTeDoanhThu = DonHangTelesale::where('nhan_vien_telesale_id', $nhanVienId)
            ->where('trang_thai', 'thanh_cong')
            ->whereMonth('ngay_dat_hang', $thang)
            ->whereYear('ngay_dat_hang', $nam)
            ->sum('tong_thanh_toan');

        // Tỷ lệ nghe máy
        $tongCuocGoi = $thucTeCuocGoi;
        $ngheMay = CuocGoiTelesale::where('nhan_vien_telesale_id', $nhanVienId)
            ->whereMonth('thoi_gian_bat_dau', $thang)
            ->whereYear('thoi_gian_bat_dau', $nam)
            ->where('ket_qua', '!=', 'khong_nghe_may')
            ->count();
        $tyLeNgheMay = $tongCuocGoi > 0 ? round(($ngheMay / $tongCuocGoi) * 100, 2) : 0;

        // Tỷ lệ chốt đơn
        $tyLeChotDon = $thucTeCuocGoi > 0 ? round(($thucTeDonHang / $thucTeCuocGoi) * 100, 2) : 0;

        // Thời gian gọi trung bình
        $thoiGianTB = CuocGoiTelesale::where('nhan_vien_telesale_id', $nhanVienId)
            ->whereMonth('thoi_gian_bat_dau', $thang)
            ->whereYear('thoi_gian_bat_dau', $nam)
            ->avg('thoi_luong');

        $kpi->update([
            'thuc_te_cuoc_goi' => $thucTeCuocGoi,
            'thuc_te_don_hang' => $thucTeDonHang,
            'thuc_te_doanh_thu' => $thucTeDoanhThu,
            'ty_le_nghe_may' => $tyLeNgheMay,
            'ty_le_chot_don' => $tyLeChotDon,
            'thoi_gian_goi_trung_binh' => round($thoiGianTB ?? 0),
        ]);

        return $kpi;
    }

    // Tính tổng đơn hàng telesale
    public function tinhTongDonHang($donHangId)
    {
        $donHang = DonHangTelesale::with('chiTiets')->findOrFail($donHangId);
        
        $tongTien = $donHang->chiTiets->sum('thanh_tien');
        $tongThanhToan = $tongTien + $donHang->phi_ship;
        
        $donHang->update([
            'tong_tien' => $tongTien,
            'tong_thanh_toan' => $tongThanhToan,
        ]);
        
        return $donHang;
    }
}
