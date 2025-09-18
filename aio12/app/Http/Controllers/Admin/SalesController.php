<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\HoaDon;
use App\Models\Admin\NhanVienThucHien;
use App\Models\Admin\NhanVienTuVan;
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



        if (empty($request->khoangThoiGian)) {
            // mặc định là khoảng thời gian 7 ngày gần nhất
            $khoangThoiGian = [now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s'), now()->endOfDay()->format('Y-m-d H:i:s')];
        } else {
            $khoangThoiGian = $request->khoangThoiGian;
        }

        $props = [
            'soLuongSPTheoLoai' => $soLuongSPTheoLoai,
            'chiNhanh' => $chiNhanh,
            'nhanVien' => $nhanVien,
            'khoangThoiGian' => $khoangThoiGian,
        ];
        return Inertia::render('Admin/Dashboard/sales', $props);
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

    /**
     * Summary of report_doanhThu
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    function report_doanhThu(Request $request)
    {
        if (empty($request->startDate) || empty($request->endDate)) {
            // return $this->sendErrorResponse('Vui lòng chọn khoảng thời gian');
            $startDate = now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s');
            $endDate = now()->endOfDay()->format('Y-m-d H:i:s');

        } else {
            $startDate = $request->startDate;
            $endDate = $request->endDate;
        }

        if (!empty($request->title)) {
            $title = $request->title;
        } else {
            $title = date('d/m/Y', strtotime($startDate)) . ' - ' . date('d/m/Y', strtotime($endDate));
        }

        $dataDoanhThu = HoaDon::where('hoa_don_status_id', '!=', 4)
            ->where('is_draft', '!=', 1)
            ->where('is_recycle_bin', '!=', 1)
            ->whereBetween('ngay_tao', [$startDate, $endDate])
            ->selectRaw('DATE(ngay_tao) as date, SUM(thanh_toan) as revenue')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->toArray();

        // khach hang mới
        $slKhachHangMoi = User::where('is_recycle_bin', '!=', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $khachHangMoi = User::where('is_recycle_bin', '!=', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        // tổng đơn hàng mới
        $slDonHangMoi = HoaDon::where('is_recycle_bin', '!=', 1)
            ->whereBetween('ngay_tao', [$startDate, $endDate])
            ->count();

        $doanhThu = HoaDon::where('hoa_don_status_id', '!=', 4)
            ->where('is_draft', '!=', 1)
            ->where('is_recycle_bin', '!=', 1)
            ->whereBetween('ngay_tao', [$startDate, $endDate])
            ->sum('thanh_toan');
        return $this->sendSuccessResponse([
            'dataDoanhThu' => $dataDoanhThu,
            'slKhachHangMoi' => $slKhachHangMoi,
            'khachHangMoi' => $khachHangMoi,
            'slDonHangMoi' => $slDonHangMoi,
            'doanhThu' => $doanhThu,
            'title' => $title
        ]);
    }

    /**
     * Summary of report_DonHang
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    function report_DonHang(Request $request)
    {
        if (empty($request->startDate) || empty($request->endDate)) {
            // return $this->sendErrorResponse('Vui lòng chọn khoảng thời gian');
            $startDate = now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s');
            $endDate = now()->endOfDay()->format('Y-m-d H:i:s');

        } else {
            $startDate = $request->startDate;
            $endDate = $request->endDate;
        }

        if (!empty($request->title)) {
            $title = $request->title;
        } else {
            $title = date('d/m/Y', strtotime($startDate)) . ' - ' . date('d/m/Y', strtotime($endDate));
        }

        $dataDonHang = HoaDon::where('is_draft', '!=', 1)
            ->where('is_recycle_bin', '!=', 1)
            ->whereBetween('ngay_tao', [$startDate, $endDate])
            ->selectRaw('DATE(ngay_tao) as date, COUNT(id) as total_orders, SUM(thanh_toan) as total_revenue, MIN(id) as `key`')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->toArray();

        $dataChart = HoaDon::where('is_draft', '!=', 1)
            ->where('is_recycle_bin', '!=', 1)
            ->whereBetween('ngay_tao', [$startDate, $endDate])
            ->selectRaw('DATE(ngay_tao) as date, COUNT(id) as orders')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get('id as key, date as name, COUNT(id) as value')
            ->toArray();

        return $this->sendSuccessResponse([
            'dataDonHang' => $dataDonHang,
            'title' => $title,
            'dataChart' => $dataChart,
        ]);
    }

    function report_khachHang(Request $request)
    {
        if (empty($request->startDate) || empty($request->endDate)) {
            // return $this->sendErrorResponse('Vui lòng chọn khoảng thời gian');
            $startDate = now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s');
            $endDate = now()->endOfDay()->format('Y-m-d H:i:s');

        } else {
            $startDate = $request->startDate;
            $endDate = $request->endDate;
        }

        if (!empty($request->title)) {
            $title = $request->title;
        } else {
            $title = date('d/m/Y', strtotime($startDate)) . ' - ' . date('d/m/Y', strtotime($endDate));
        }

        $dataKhachHang = HoaDon::where('hoa_don.is_recycle_bin', '!=', 1)
            ->whereBetween('hoa_don.created_at', [$startDate, $endDate])
            ->selectRaw('sum(hoa_don.thanh_toan) as thanh_toan, COUNT(hoa_don.users_id) as total_orders, MIN(hoa_don.id) as `key`, MAX(hoa_don.ngay_tao) as ngay_tao, users.name as users_name, users.id as users_id')
            ->groupBy('hoa_don.users_id', 'users.name')
            ->leftJoin('users', 'users.id', '=', 'hoa_don.users_id')
            ->orderBy('ngay_tao', 'asc')
            ->get()
            ->toArray();

        $dataChart = HoaDon::where('hoa_don.is_recycle_bin', '!=', 1)
            ->whereBetween('hoa_don.created_at', [$startDate, $endDate])
            ->selectRaw('sum(hoa_don.thanh_toan) as thanh_toan, COUNT(hoa_don.users_id) as total_orders, MIN(hoa_don.id) as `key`, MAX(hoa_don.ngay_tao) as ngay_tao')
            ->groupBy('hoa_don.users_id')
            ->orderBy('ngay_tao', 'asc')
            ->get()
            ->toArray();

        return $this->sendSuccessResponse([
            'dataKhachHang' => $dataKhachHang,
            'title' => $title,
            'dataChart' => $dataChart,
        ]);
    }

    function report_nhanVienSale(Request $request)
    {
        if (empty($request->startDate) || empty($request->endDate)) {
            // return $this->sendErrorResponse('Vui lòng chọn khoảng thời gian');
            $startDate = now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s');
            $endDate = now()->endOfDay()->format('Y-m-d H:i:s');

        } else {
            $startDate = $request->startDate;
            $endDate = $request->endDate;
        }

        if (!empty($request->title)) {
            $title = $request->title;
        } else {
            $title = date('d/m/Y', strtotime($startDate)) . ' - ' . date('d/m/Y', strtotime($endDate));
        }

        $dataNhanVien = NhanVienTuVan::where('nhan_vien_tu_van.is_recycle_bin', '!=', 1)
            ->whereBetween('nhan_vien_tu_van.created_at', [$startDate, $endDate])
            ->selectRaw('
                sum(hoa_don_chi_tiet.thanh_tien) as thanh_tien, 
                COUNT(nhan_vien_tu_van.nhan_vien_id) as total_orders, 
                MIN(nhan_vien_tu_van.id) as `key`, 
                MAX(nhan_vien_tu_van.created_at) as created_at, 
                admin_users.name as users_name, 
                admin_users.id as users_id,
                admin_users.code as code'
            )
            ->groupBy('nhan_vien_tu_van.nhan_vien_id', 'admin_users.name', 'admin_users.code')
            ->leftJoin('admin_users', 'admin_users.id', '=', 'nhan_vien_tu_van.nhan_vien_id')
            ->leftJoin('hoa_don_chi_tiet', 'hoa_don_chi_tiet.id', '=', 'nhan_vien_tu_van.chung_tu_chi_tiet_id')
            // ->orderBy('nhan_vien_tu_van.created_at', 'asc')
            ->get()
            ->toArray();

        return $this->sendSuccessResponse([
            'dataNhanVien' => $dataNhanVien,
            'title' => $title,
        ]);
    }

    function report_nhanVienKT(Request $request)
    {
        if (empty($request->startDate) || empty($request->endDate)) {
            // return $this->sendErrorResponse('Vui lòng chọn khoảng thời gian');
            $startDate = now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s');
            $endDate = now()->endOfDay()->format('Y-m-d H:i:s');

        } else {
            $startDate = $request->startDate;
            $endDate = $request->endDate;
        }

        if (!empty($request->title)) {
            $title = $request->title;
        } else {
            $title = date('d/m/Y', strtotime($startDate)) . ' - ' . date('d/m/Y', strtotime($endDate));
        }

        $dataNhanVien = NhanVienThucHien::where('nhan_vien_thuc_hien.is_recycle_bin', '!=', 1)
            ->whereBetween('nhan_vien_thuc_hien.created_at', [$startDate, $endDate])
            ->selectRaw('
                sum(hoa_don_chi_tiet.thanh_tien) as thanh_tien, 
                COUNT(nhan_vien_thuc_hien.nhan_vien_id) as total_orders, 
                MIN(nhan_vien_thuc_hien.id) as `key`, 
                MAX(nhan_vien_thuc_hien.created_at) as created_at, 
                admin_users.name as users_name, 
                admin_users.id as users_id,
                admin_users.code as code'
            )
            ->groupBy('nhan_vien_thuc_hien.nhan_vien_id', 'admin_users.name', 'admin_users.code')
            ->leftJoin('admin_users', 'admin_users.id', '=', 'nhan_vien_thuc_hien.nhan_vien_id')
            ->leftJoin('hoa_don_chi_tiet', 'hoa_don_chi_tiet.id', '=', 'nhan_vien_thuc_hien.chung_tu_chi_tiet_id')
            // ->orderBy('nhan_vien_thuc_hien.created_at', 'asc')
            ->get()
            ->toArray();

        return $this->sendSuccessResponse([
            'dataNhanVien' => $dataNhanVien,
            'title' => $title,
        ]);
    }

    public function report_congNo(Request $request)
    {
        if (empty($request->startDate) || empty($request->endDate)) {
            $startDate = now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s');
            $endDate = now()->endOfDay()->format('Y-m-d H:i:s');

        } else {
            $startDate = $request->startDate;
            $endDate = $request->endDate;
        }

        if (!empty($request->title)) {
            $title = $request->title;
        } else {
            $title = date('d/m/Y', strtotime($startDate)) . ' - ' . date('d/m/Y', strtotime($endDate));
        }

        $dataCongNo = HoaDon::where('hoa_don.is_recycle_bin', '!=', 1)
            ->whereBetween('hoa_don.created_at', [$startDate, $endDate])
            ->where('hoa_don.cong_no', '>', 0)
            ->selectRaw('sum(hoa_don.cong_no) as cong_no,sum(hoa_don.thanh_toan) as thanh_toan, sum(hoa_don.da_thanh_toan) as da_thanh_toan, MIN(hoa_don.id) as `key`, MAX(hoa_don.ngay_tao) as ngay_tao, users.name as users_name, users.id as users_id')
            ->groupBy('hoa_don.users_id', 'users.name')
            ->leftJoin('users', 'users.id', '=', 'hoa_don.users_id')
            // ->orderBy('ngay_tao', 'asc')
            ->get()
            ->toArray();

        return $this->sendSuccessResponse([
            'dataCongNo' => $dataCongNo,
            'title' => $title,
        ]);
    }
}
