<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\ChiNhanh;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\HoaDon;
use App\Models\AdminUser;
use App\Models\User;

class ReportController extends Controller
{

    public function index()
    {
        $soLuongSPTheoLoai = [];
        
        
        $chiNhanh = ChiNhanh::where('chi_nhanh_status_id', 1)->get();
        $nhanVien = AdminUser::where('admin_user_status_id', 1)->get();
        
        // tính tổng doanh thu trong 7 ngày gần nhất
        $doanhThu = HoaDon::where('hoa_don_status_id', '!=',4)
            ->where('is_draft','!=',1)
            ->where('is_recycle_bin','!=',1)
            ->where('created_at', '>=', now()->subDays(7))
            ->sum('thanh_toan');
        // khach hang mới
        $slKhachHangMoi  = User::where('is_recycle_bin','!=',1)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $khachHangMoi  = User::where('is_recycle_bin','!=',1)
            ->where('created_at', '>=', now()->subDays(7))
            ->get();

        // tổng đơn hàng mới
        $slDonHangMoi = HoaDon::where('is_recycle_bin', '!=', 1)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $props = [
            'soLuongSPTheoLoai' => $soLuongSPTheoLoai,
            'chiNhanh' => $chiNhanh,
            'nhanVien' => $nhanVien,
            'doanhThu' => $doanhThu,
            'slKhachHangMoi' => $slKhachHangMoi,
            'khachHangMoi' => $khachHangMoi,
            'slDonHangMoi' => $slDonHangMoi,
        ];
        return Inertia::render('Admin/Dashboard/report', $props);
    }

    public function report_banHang(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        // $table = Table::find(236);

        $hoaDon = HoaDon::where('is_draft', '=', 0)->paginate(10);
        $viewData = [
            'tables'=>$tables,
            'hoaDon' =>$hoaDon
        ];
        // dd($hoaDon);
        return Inertia::render('Admin/Report/hoa_don', $viewData);
    }

    public function report_theDichVu(Request $request)
    {
        
    }

    public function report_khachHang(Request $request)
    {
        
    }

}
