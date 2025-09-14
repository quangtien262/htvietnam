<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\HoaDon;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\TblService;

class SalesController extends Controller
{
    public function dashboard(Request $request)
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
        return Inertia::render('Admin/Dashboard/sales', $props);
    }

    function report_doanhThu(Request $request)
    {
        $dataDoanhThu = HoaDon::where('hoa_don_status_id', '!=',4)
            ->where('is_draft','!=',1)
            ->where('is_recycle_bin','!=',1)
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(thanh_toan) as revenue')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->toArray();

        return $this->sendSuccessResponse($dataDoanhThu);
    }

    public function index(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('cong_no', $request, true, true);
        $mocThoiGian = 'today';
        if (!empty($request['mocThoiGian'])) {
            $mocThoiGian = $request['mocThoiGian'];
        }

        $khoangThoiGian = [null, null];
        if (!empty($request->khoangThoiGian)) {
            $khoangThoiGian = $request->khoangThoiGian;
            $mocThoiGian = '';
        }

        $query = TblService::getQuery('cong_no', $request);

        $soLuongCongNo = $query;
        $soLuongCongNo = $soLuongCongNo->count();

        $noPhaiTra = $query;
        $noPhaiTra = $noPhaiTra->where('so_tien_no', '<', 0)->sum('so_tien_no');

        $noCanThu = $query;
        $noCanThu = $noCanThu->where('so_tien_no', '>', 0)->sum('so_tien_no');

        $tongCongNo = $noPhaiTra + $noCanThu;

        $viewData['tongCongNo'] = $tongCongNo;
        $viewData['noCanThu'] = $noCanThu;
        $viewData['noPhaiTra'] = $noPhaiTra;
        $viewData['soLuongCongNo'] = $soLuongCongNo;
        $viewData['khoangThoiGian'] = $khoangThoiGian;
        return Inertia::render('Admin/CongNo/index', $viewData);
    }
}
