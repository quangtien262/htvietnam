<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\BangLuong;
use App\Models\Admin\ChamCong;
use App\Models\Admin\NghiPhep;
use App\Models\AdminUser;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BaoCaoNhanSuController extends Controller
{
    /**
     * Dashboard overview
     */
    public function dashboard(Request $request)
    {
        $thang = $request->thang ?? now()->month;
        $nam = $request->nam ?? now()->year;

        // Tổng nhân viên
        $tongNhanVien = AdminUser::where('admin_user_status_id', 1)->count();

        // Nhân viên mới trong tháng
        $nhanVienMoi = AdminUser::where('admin_user_status_id', 1)
            ->whereYear('ngay_vao_lam', $nam)
            ->whereMonth('ngay_vao_lam', $thang)
            ->count();

        // Nhân viên nghỉ việc trong tháng
        $nhanVienNghiViec = AdminUser::where('da_nghi_lam', 1)
            ->whereYear('updated_at', $nam)
            ->whereMonth('updated_at', $thang)
            ->count();

        // Tổng lương tháng
        $tongLuong = BangLuong::where('thang', $thang)
            ->where('nam', $nam)
            ->sum('thuc_nhan');

        // Chấm công tháng
        $chamCongStats = ChamCong::whereYear('ngay_cham_cong', $nam)
            ->whereMonth('ngay_cham_cong', $thang)
            ->selectRaw('
                COUNT(DISTINCT admin_user_id) as so_nhan_vien,
                SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) as di_lam,
                SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) as nghi_phep,
                SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) as nghi_ko_phep,
                SUM(CASE WHEN kpi = -1 THEN 1 ELSE 0 END) as di_muon
            ')
            ->first();

        // Đơn nghỉ phép
        $nghiPhepStats = NghiPhep::whereYear('tu_ngay', $nam)
            ->whereMonth('tu_ngay', $thang)
            ->selectRaw('
                COUNT(*) as tong_don,
                SUM(CASE WHEN trang_thai = "pending" THEN 1 ELSE 0 END) as cho_duyet,
                SUM(CASE WHEN trang_thai = "approved" THEN 1 ELSE 0 END) as da_duyet,
                SUM(CASE WHEN trang_thai = "rejected" THEN 1 ELSE 0 END) as tu_choi
            ')
            ->first();

        return view('admin.hr.bao-cao', [
            'thang' => $thang,
            'nam' => $nam,
            'tongNhanVien' => $tongNhanVien,
            'nhanVienMoi' => $nhanVienMoi,
            'nhanVienNghiViec' => $nhanVienNghiViec,
            'tongLuong' => $tongLuong,
            'chamCongStats' => $chamCongStats,
            'nghiPhepStats' => $nghiPhepStats,
        ]);
    }

    /**
     * Báo cáo nhân viên theo chi nhánh
     */
    public function byChiNhanh()
    {
        $data = AdminUser::where('admin_user_status_id', 1)
            ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'admin_users.chi_nhanh_id')
            ->selectRaw('
                chi_nhanh.name as ten_chi_nhanh,
                COUNT(*) as so_nhan_vien,
                SUM(CASE WHEN admin_users.gioi_tinh_id = 1 THEN 1 ELSE 0 END) as nam,
                SUM(CASE WHEN admin_users.gioi_tinh_id = 2 THEN 1 ELSE 0 END) as nu,
                AVG(admin_users.salary) as luong_trung_binh
            ')
            ->groupBy('chi_nhanh.id', 'chi_nhanh.name')
            ->get();

        return response()->json(['message' => 'success', 'data' => $data]);
    }

    /**
     * Báo cáo chấm công chi tiết
     */
    public function baoCaoChamCong(Request $request)
    {
        $thang = $request->thang ?? now()->month;
        $nam = $request->nam ?? now()->year;

        $data = ChamCong::whereYear('ngay_cham_cong', $nam)
            ->whereMonth('ngay_cham_cong', $thang)
            ->with('nhanVien')
            ->selectRaw('
                admin_user_id,
                COUNT(*) as tong_ngay,
                SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) as di_lam,
                SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) as nghi_phep,
                SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) as nghi_ko_phep,
                SUM(CASE WHEN kpi = -1 THEN 1 ELSE 0 END) as di_muon_ve_som,
                SUM(gio_lam_them) as tong_gio_lam_them
            ')
            ->groupBy('admin_user_id')
            ->get();

        return response()->json(['message' => 'success', 'data' => $data]);
    }

    /**
     * Báo cáo lương
     */
    public function baoCaoLuong(Request $request)
    {
        $thang = $request->thang ?? now()->month;
        $nam = $request->nam ?? now()->year;

        $data = BangLuong::with('nhanVien')
            ->where('thang', $thang)
            ->where('nam', $nam)
            ->selectRaw('
                admin_user_id,
                luong_co_ban,
                so_ngay_cong_thuc_te,
                tien_lam_them,
                tong_thuong,
                tong_phu_cap,
                tru_bhxh,
                tru_bhyt,
                tru_bhtn,
                tru_thue_tncn,
                thuc_nhan,
                trang_thai
            ')
            ->get();

        $tongHop = [
            'tong_nhan_vien' => $data->count(),
            'tong_luong_co_ban' => $data->sum('luong_co_ban'),
            'tong_lam_them' => $data->sum('tien_lam_them'),
            'tong_thuong' => $data->sum('tong_thuong'),
            'tong_thuc_nhan' => $data->sum('thuc_nhan'),
        ];

        return response()->json([
            'message' => 'success',
            'data' => $data,
            'tong_hop' => $tongHop,
        ]);
    }

    /**
     * Báo cáo nghỉ phép
     */
    public function baoCaoNghiPhep(Request $request)
    {
        $nam = $request->nam ?? now()->year;

        $data = NghiPhep::with('nhanVien')
            ->whereYear('tu_ngay', $nam)
            ->selectRaw('
                admin_user_id,
                loai_nghi,
                COUNT(*) as so_don,
                SUM(so_ngay_nghi) as tong_ngay_nghi,
                SUM(CASE WHEN trang_thai = "approved" THEN so_ngay_nghi ELSE 0 END) as ngay_duoc_duyet
            ')
            ->groupBy('admin_user_id', 'loai_nghi')
            ->get();

        return response()->json(['message' => 'success', 'data' => $data]);
    }
}
