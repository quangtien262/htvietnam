<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GiaoDichNganHang;
use App\Models\TaiKhoanNganHang;
use App\Models\HoaDon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ERPDashboardController extends Controller
{
    public function index(Request $request)
    {
        return view('admin.erp.dashboard');
    }

    /**
     * Tổng quan tài chính
     */
    public function apiOverview(Request $request)
    {
        $tu_ngay = $request->input('tu_ngay', now()->startOfMonth()->format('Y-m-d'));
        $den_ngay = $request->input('den_ngay', now()->endOfMonth()->format('Y-m-d'));

        // Thu từ ngân hàng
        $tong_thu_ngan_hang = GiaoDichNganHang::where('loai_giao_dich', 'thu')
            ->whereBetween('ngay_giao_dich', [$tu_ngay, $den_ngay])
            ->sum('so_tien');

        // Chi từ ngân hàng
        $tong_chi_ngan_hang = GiaoDichNganHang::where('loai_giao_dich', 'chi')
            ->whereBetween('ngay_giao_dich', [$tu_ngay, $den_ngay])
            ->sum('so_tien');

        // Số dư tài khoản ngân hàng
        $so_du_ngan_hang = TaiKhoanNganHang::active()->sum('so_du_hien_tai');

        // Hóa đơn chưa thanh toán
        $tong_cong_no = HoaDon::chuaThanhToan()->sum('con_lai');

        // Hóa đơn quá hạn
        $hoa_don_qua_han = HoaDon::quaHan()->count();

        // Doanh thu từ hóa đơn
        $doanh_thu = HoaDon::whereBetween('ngay_hoa_don', [$tu_ngay, $den_ngay])
            ->sum('tong_tien');

        // Đã thu từ hóa đơn
        $da_thu = HoaDon::whereBetween('ngay_hoa_don', [$tu_ngay, $den_ngay])
            ->sum('da_thanh_toan');

        return response()->json([
            'status_code' => 200,
            'data' => [
                'tong_thu' => $tong_thu_ngan_hang,
                'tong_chi' => $tong_chi_ngan_hang,
                'loi_nhuan' => $tong_thu_ngan_hang - $tong_chi_ngan_hang,
                'so_du_ngan_hang' => $so_du_ngan_hang,
                'tong_cong_no' => $tong_cong_no,
                'hoa_don_qua_han' => $hoa_don_qua_han,
                'doanh_thu' => $doanh_thu,
                'da_thu' => $da_thu,
                'con_phai_thu' => $doanh_thu - $da_thu,
            ]
        ]);
    }

    /**
     * Biểu đồ dòng tiền theo thời gian
     */
    public function apiCashFlow(Request $request)
    {
        $tu_ngay = $request->input('tu_ngay', now()->startOfMonth()->format('Y-m-d'));
        $den_ngay = $request->input('den_ngay', now()->endOfMonth()->format('Y-m-d'));
        $group_by = $request->input('group_by', 'day'); // day, month

        if ($group_by === 'month') {
            $dateFormat = '%Y-%m';
            $selectFormat = 'DATE_FORMAT(ngay_giao_dich, "%Y-%m") as period';
        } else {
            $dateFormat = '%Y-%m-%d';
            $selectFormat = 'DATE_FORMAT(ngay_giao_dich, "%Y-%m-%d") as period';
        }

        $cashFlow = GiaoDichNganHang::selectRaw("
                $selectFormat,
                SUM(CASE WHEN loai_giao_dich = 'thu' THEN so_tien ELSE 0 END) as thu,
                SUM(CASE WHEN loai_giao_dich = 'chi' THEN so_tien ELSE 0 END) as chi
            ")
            ->whereBetween('ngay_giao_dich', [$tu_ngay, $den_ngay])
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'ngay' => $item->period,
                    'thu' => (float) $item->thu,
                    'chi' => (float) $item->chi,
                    'chenh_lech' => (float) ($item->thu - $item->chi),
                ];
            });

        return response()->json([
            'status_code' => 200,
            'data' => $cashFlow
        ]);
    }

    /**
     * Công nợ theo đối tác
     */
    public function apiCongNo(Request $request)
    {
        $loai = $request->input('loai', 'phai_thu'); // phai_thu, phai_tra

        if ($loai === 'phai_thu') {
            // Công nợ phải thu từ hóa đơn
            $congNo = HoaDon::select([
                    'ten_khach_hang as doi_tac',
                    'so_dien_thoai',
                    DB::raw('SUM(tong_tien) as tong_tien'),
                    DB::raw('SUM(da_thanh_toan) as da_thanh_toan'),
                    DB::raw('SUM(con_lai) as con_lai'),
                    DB::raw('MIN(ngay_het_han) as ngay_het_han_gan_nhat'),
                ])
                ->where('con_lai', '>', 0)
                ->groupBy('ten_khach_hang', 'so_dien_thoai')
                ->orderBy('con_lai', 'desc')
                ->get();

            $tong = HoaDon::where('con_lai', '>', 0)->sum('con_lai');
            $qua_han = HoaDon::quaHan()->sum('con_lai');
        } else {
            // Công nợ phải trả - có thể mở rộng sau
            $congNo = [];
            $tong = 0;
            $qua_han = 0;
        }

        return response()->json([
            'status_code' => 200,
            'data' => [
                'danh_sach' => $congNo,
                'tong' => $tong,
                'qua_han' => $qua_han,
                'sap_den_han' => $tong - $qua_han,
            ]
        ]);
    }

    /**
     * Biểu đồ phân tích
     */
    public function apiChart(Request $request)
    {
        $type = $request->input('type', 'thu_chi_theo_thang');
        $nam = $request->input('nam', now()->year);

        switch ($type) {
            case 'thu_chi_theo_thang':
                $data = $this->getThuChiTheoThang($nam);
                break;

            case 'top_khach_hang':
                $data = $this->getTopKhachHang();
                break;

            case 'tai_khoan_ngan_hang':
                $data = $this->getSoDuTaiKhoanNganHang();
                break;

            default:
                $data = [];
        }

        return response()->json([
            'status_code' => 200,
            'data' => $data
        ]);
    }

    private function getThuChiTheoThang($nam)
    {
        $result = [];

        for ($thang = 1; $thang <= 12; $thang++) {
            $tu_ngay = "{$nam}-{$thang}-01";
            $den_ngay = date('Y-m-t', strtotime($tu_ngay));

            $thu = GiaoDichNganHang::where('loai_giao_dich', 'thu')
                ->whereBetween('ngay_giao_dich', [$tu_ngay, $den_ngay])
                ->sum('so_tien');

            $chi = GiaoDichNganHang::where('loai_giao_dich', 'chi')
                ->whereBetween('ngay_giao_dich', [$tu_ngay, $den_ngay])
                ->sum('so_tien');

            $result[] = [
                'thang' => "Tháng {$thang}",
                'thu' => (float) $thu,
                'chi' => (float) $chi,
                'loi_nhuan' => (float) ($thu - $chi),
            ];
        }

        return $result;
    }

    private function getTopKhachHang($limit = 10)
    {
        return HoaDon::select([
                'ten_khach_hang',
                DB::raw('COUNT(*) as so_hoa_don'),
                DB::raw('SUM(tong_tien) as tong_tien'),
                DB::raw('SUM(da_thanh_toan) as da_thanh_toan'),
            ])
            ->groupBy('ten_khach_hang')
            ->orderBy('tong_tien', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'ten_khach_hang' => $item->ten_khach_hang,
                    'so_hoa_don' => $item->so_hoa_don,
                    'tong_tien' => (float) $item->tong_tien,
                    'da_thanh_toan' => (float) $item->da_thanh_toan,
                ];
            });
    }

    private function getSoDuTaiKhoanNganHang()
    {
        return TaiKhoanNganHang::active()
            ->get()
            ->map(function ($tk) {
                return [
                    'ten_ngan_hang' => $tk->ten_ngan_hang,
                    'so_tai_khoan' => $tk->so_tai_khoan,
                    'so_du' => (float) $tk->so_du_hien_tai,
                ];
            });
    }
}
