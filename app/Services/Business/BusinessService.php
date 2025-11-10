<?php

namespace App\Services\Business;

use App\Models\Business\{CoHoiKinhDoanh, BaoGia, ChienDichMarketing, MucTieuKinhDoanh};
use Illuminate\Support\Facades\DB;

class BusinessService
{
    // Tính ROI chiến dịch marketing
    public function tinhROI($chienDichId)
    {
        $chienDich = ChienDichMarketing::findOrFail($chienDichId);
        
        if ($chienDich->chi_phi_thuc_te > 0) {
            $roi = (($chienDich->doanh_thu - $chienDich->chi_phi_thuc_te) / $chienDich->chi_phi_thuc_te) * 100;
            $chienDich->update(['roi' => round($roi, 2)]);
        }
        
        return $chienDich;
    }

    // Tính tỷ lệ chuyển đổi leads → customers
    public function tinhTyLeChuyenDoi($chienDichId)
    {
        $chienDich = ChienDichMarketing::findOrFail($chienDichId);
        
        if ($chienDich->so_leads_tao_ra > 0) {
            return round(($chienDich->so_khach_hang_chuyen_doi / $chienDich->so_leads_tao_ra) * 100, 2);
        }
        
        return 0;
    }

    // Cập nhật tiến độ mục tiêu
    public function capNhatMucTieu($mucTieuId, $giaTriMoi)
    {
        $mucTieu = MucTieuKinhDoanh::findOrFail($mucTieuId);
        
        $mucTieu->gia_tri_hien_tai = $giaTriMoi;
        
        if ($mucTieu->gia_tri_muc_tieu > 0) {
            $mucTieu->ty_le_hoan_thanh = round(($giaTriMoi / $mucTieu->gia_tri_muc_tieu) * 100, 2);
        }
        
        $mucTieu->save();
        
        return $mucTieu;
    }

    // Tính tổng báo giá
    public function tinhTongBaoGia($baoGiaId)
    {
        $baoGia = BaoGia::with('chiTiets')->findOrFail($baoGiaId);
        
        $tongTien = $baoGia->chiTiets->sum('thanh_tien');
        $tongCong = $tongTien - $baoGia->tien_giam_gia;
        
        $baoGia->update([
            'tong_tien' => $tongTien,
            'tong_cong' => $tongCong,
        ]);
        
        return $baoGia;
    }
}
