<?php

namespace App\Services\Spa;

use App\Models\Spa\HoaDon;
use App\Models\User;
use App\Models\Spa\Booking;
use App\Models\Spa\KTV;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnalyticsService
{
    public function getDashboard($params = [])
    {
        $startDate = $params['tu_ngay'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $params['den_ngay'] ?? now()->endOfMonth()->format('Y-m-d');
        $chiNhanhId = $params['chi_nhanh_id'] ?? null;

        try {
            $totalRooms = DB::table('spa_phong')->where('is_active', 1)->count();
            $usedRooms = DB::table('spa_bookings')
                ->whereDate('ngay_hen', now())
                ->whereIn('trang_thai', ['dang_thuc_hien', 'hoan_thanh'])
                ->whereNotNull('phong_id')
                ->distinct()
                ->count('phong_id');

            $totalStaff = DB::table('spa_ktv')
                ->join('admin_users', 'spa_ktv.admin_user_id', '=', 'admin_users.id')
                ->where('admin_users.admin_user_status_id', 1)
                ->count();

            $workingStaff = DB::table('spa_bookings')
                ->whereDate('ngay_hen', now())
                ->where('trang_thai', 'dang_thuc_hien')
                ->whereNotNull('ktv_id')
                ->distinct()
                ->count('ktv_id');

            $todayRevenue = HoaDon::paid()
                ->whereDate('ngay_ban', now())
                ->sum('tong_thanh_toan');

            $yesterdayRevenue = HoaDon::paid()
                ->whereDate('ngay_ban', now()->subDay())
                ->sum('tong_thanh_toan');

            $growthRate = $yesterdayRevenue > 0
                ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
                : 0;

            $todayBookings = DB::table('spa_bookings')
                ->whereDate('ngay_hen', now())
                ->count();

            $waitingBookings = DB::table('spa_bookings')
                ->whereDate('ngay_hen', now())
                ->where('trang_thai', 'da_xac_nhan')
                ->count();

            return [
                'doanhThuHomNay' => (float) $todayRevenue ?? 0,
                'tangTruongDoanhThu' => (float) $growthRate ?? 0,
                'soLichHenHomNay' => (int) $todayBookings ?? 0,
                'soLichHenDangCho' => (int) $waitingBookings ?? 0,
                'soPhongDangSuDung' => (int) $usedRooms ?? 0,
                'tongSoPhong' => (int) $totalRooms ?? 0,
                'soNhanVienLamViec' => (int) $workingStaff ?? 0,
                'tongSoNhanVien' => (int) $totalStaff ?? 0,
                'revenue' => $this->getRevenue($startDate, $endDate, $chiNhanhId),
                'customers' => $this->getCustomerStats($startDate, $endDate),
                'bookings' => $this->getBookingStats($startDate, $endDate, $chiNhanhId),
                'top_services' => $this->getTopServices($startDate, $endDate, 5),
                'top_products' => $this->getTopProducts($startDate, $endDate, 5),
                'top_staff' => $this->getTopStaff($startDate, $endDate, 5),
            ];
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getRevenue($startDate, $endDate, $chiNhanhId = null)
    {
        $query = HoaDon::paid()->dateRange($startDate, $endDate);

        if ($chiNhanhId) {
            $query->where('chi_nhanh_id', $chiNhanhId);
        }

        $invoices = $query->get();

        return [
            'total' => $invoices->sum('tong_thanh_toan'),
            'service_revenue' => $invoices->sum('tong_tien_dich_vu'),
            'product_revenue' => $invoices->sum('tong_tien_san_pham'),
            'total_discount' => $invoices->sum('giam_gia'),
            'total_tips' => $invoices->sum('tien_tip'),
            'invoice_count' => $invoices->count(),
            'average_invoice' => $invoices->avg('tong_thanh_toan'),
            'daily_revenue' => $this->getDailyRevenue($startDate, $endDate, $chiNhanhId),
        ];
    }

    public function getDailyRevenue($startDate, $endDate, $chiNhanhId = null)
    {
        $query = HoaDon::paid()
            ->dateRange($startDate, $endDate)
            ->select(
                DB::raw('DATE(ngay_ban) as date'),
                DB::raw('SUM(tong_thanh_toan) as total'),
                DB::raw('SUM(tong_tien_dich_vu) as service'),
                DB::raw('SUM(tong_tien_san_pham) as product'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw('DATE(ngay_ban)'))
            ->orderBy('date');

        if ($chiNhanhId) {
            $query->where('chi_nhanh_id', $chiNhanhId);
        }

        return $query->get();
    }

    public function getCustomerStats($startDate, $endDate)
    {
        $totalCustomers = User::count();
        $newCustomers = User::whereBetween('created_at', [$startDate, $endDate])->count();
        $activeCustomers = User::whereBetween('updated_at', [$startDate, $endDate])->count();

        return [
            'total' => $totalCustomers,
            'new' => $newCustomers,
            'active' => $activeCustomers,
            'vip' => User::where('loai_khach', 'VIP')->count(),
            'retention_rate' => $totalCustomers > 0 ? ($activeCustomers / $totalCustomers) * 100 : 0,
        ];
    }

    public function getBookingStats($startDate, $endDate, $chiNhanhId = null)
    {
        $query = Booking::whereBetween('ngay_hen', [$startDate, $endDate]);

        if ($chiNhanhId) {
            $query->where('chi_nhanh_id', $chiNhanhId);
        }

        $totalBookings = $query->count();
        $completedBookings = (clone $query)->completed()->count();
        $cancelledBookings = (clone $query)->cancelled()->count();

        return [
            'total' => $totalBookings,
            'completed' => $completedBookings,
            'cancelled' => $cancelledBookings,
            'completion_rate' => $totalBookings > 0 ? ($completedBookings / $totalBookings) * 100 : 0,
            'cancellation_rate' => $totalBookings > 0 ? ($cancelledBookings / $totalBookings) * 100 : 0,
        ];
    }

    public function getTopServices($startDate, $endDate, $limit = 10)
    {
        return DB::table('spa_hoa_don_chi_tiet')
            ->join('spa_hoa_don', 'spa_hoa_don_chi_tiet.hoa_don_id', '=', 'spa_hoa_don.id')
            ->join('spa_dich_vu', 'spa_hoa_don_chi_tiet.dich_vu_id', '=', 'spa_dich_vu.id')
            ->whereBetween('spa_hoa_don.ngay_ban', [$startDate, $endDate])
            ->where('spa_hoa_don.trang_thai', 'da_thanh_toan')
            ->whereNotNull('spa_hoa_don_chi_tiet.dich_vu_id')
            ->select(
                'spa_dich_vu.ten_dich_vu',
                DB::raw('SUM(spa_hoa_don_chi_tiet.so_luong) as total_quantity'),
                DB::raw('SUM(spa_hoa_don_chi_tiet.thanh_tien) as total_revenue')
            )
            ->groupBy('spa_dich_vu.id', 'spa_dich_vu.ten_dich_vu')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getTopProducts($startDate, $endDate, $limit = 10)
    {
        return DB::table('spa_hoa_don_chi_tiet')
            ->join('spa_hoa_don', 'spa_hoa_don_chi_tiet.hoa_don_id', '=', 'spa_hoa_don.id')
            ->join('spa_san_pham', 'spa_hoa_don_chi_tiet.san_pham_id', '=', 'spa_san_pham.id')
            ->whereBetween('spa_hoa_don.ngay_ban', [$startDate, $endDate])
            ->where('spa_hoa_don.trang_thai', 'da_thanh_toan')
            ->whereNotNull('spa_hoa_don_chi_tiet.san_pham_id')
            ->select(
                'spa_san_pham.ten_san_pham',
                DB::raw('SUM(spa_hoa_don_chi_tiet.so_luong) as total_quantity'),
                DB::raw('SUM(spa_hoa_don_chi_tiet.thanh_tien) as total_revenue')
            )
            ->groupBy('spa_san_pham.id', 'spa_san_pham.ten_san_pham')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getTopStaff($startDate, $endDate, $limit = 10)
    {
        return DB::table('spa_ktv_hoa_hong')
            ->join('spa_ktv', 'spa_ktv_hoa_hong.ktv_id', '=', 'spa_ktv.id')
            ->join('admin_users', 'spa_ktv.admin_user_id', '=', 'admin_users.id')
            ->whereBetween('spa_ktv_hoa_hong.thang', [$startDate, $endDate])
            ->select(
                'admin_users.name as ho_ten',
                'spa_ktv.ma_ktv',
                DB::raw('SUM(spa_ktv_hoa_hong.gia_tri_goc) as total_revenue'),
                DB::raw('SUM(spa_ktv_hoa_hong.tien_hoa_hong) as total_commission'),
                DB::raw('COUNT(DISTINCT spa_ktv_hoa_hong.hoa_don_id) as total_orders')
            )
            ->groupBy('spa_ktv.id', 'admin_users.name', 'spa_ktv.ma_ktv')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getCustomerSegmentation()
    {
        // Simplified segmentation based on User table
        $totalCustomers = User::count();
        $vipCustomers = User::where('loai_khach', 'VIP')->count();
        $regularCustomers = User::where('loai_khach', 'Thuong')->count();
        $newCustomers = User::where('loai_khach', 'Moi')->count();

        return [
            'Champions' => $vipCustomers,
            'Loyal Customers' => $regularCustomers,
            'Potential Loyalists' => $newCustomers,
            'At Risk' => 0,
            'Lost' => 0,
        ];
    }

    private function getRFMSegment($score)
    {
        if ($score >= 13) return 'Champions';
        if ($score >= 10) return 'Loyal Customers';
        if ($score >= 7) return 'Potential Loyalists';
        if ($score >= 5) return 'At Risk';
        return 'Lost';
    }

    public function exportReport($type, $startDate, $endDate, $params = [])
    {
        switch ($type) {
            case 'revenue':
                return $this->exportRevenueReport($startDate, $endDate, $params);
            case 'customer':
                return $this->exportCustomerReport($startDate, $endDate);
            case 'staff_commission':
                return $this->exportStaffCommissionReport($startDate, $endDate);
            default:
                throw new \Exception('Invalid report type');
        }
    }

    private function exportRevenueReport($startDate, $endDate, $params)
    {
        $dailyRevenue = $this->getDailyRevenue($startDate, $endDate, $params['chi_nhanh_id'] ?? null);

        // TODO: Generate Excel file
        return $dailyRevenue;
    }

    private function exportCustomerReport($startDate, $endDate)
    {
        $customers = User::whereBetween('created_at', [$startDate, $endDate])
            ->get();

        // TODO: Generate Excel file
        return $customers;
    }

    private function exportStaffCommissionReport($startDate, $endDate)
    {
        $commissions = DB::table('spa_ktv_hoa_hong')
            ->join('spa_ktv', 'spa_ktv_hoa_hong.ktv_id', '=', 'spa_ktv.id')
            ->join('admin_users', 'spa_ktv.admin_user_id', '=', 'admin_users.id')
            ->whereBetween('spa_ktv_hoa_hong.thang', [$startDate, $endDate])
            ->select('spa_ktv.*', 'spa_ktv_hoa_hong.*', 'admin_users.name as ten_nhan_vien')
            ->get();

        // TODO: Generate Excel file
        return $commissions;
    }

    public function getServiceAnalytics($params = [])
    {
        $startDate = $params['tu_ngay'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $params['den_ngay'] ?? now()->endOfMonth()->format('Y-m-d');

        $services = DB::table('spa_hoa_don_chi_tiet')
            ->join('spa_hoa_don', 'spa_hoa_don_chi_tiet.hoa_don_id', '=', 'spa_hoa_don.id')
            ->join('spa_dich_vu', 'spa_hoa_don_chi_tiet.dich_vu_id', '=', 'spa_dich_vu.id')
            ->leftJoin('spa_danh_muc_dich_vu', 'spa_dich_vu.danh_muc_id', '=', 'spa_danh_muc_dich_vu.id')
            ->whereBetween('spa_hoa_don.ngay_ban', [$startDate, $endDate])
            ->where('spa_hoa_don.trang_thai', 'da_thanh_toan')
            ->whereNotNull('spa_hoa_don_chi_tiet.dich_vu_id')
            ->select(
                'spa_dich_vu.ten_dich_vu as name',
                'spa_danh_muc_dich_vu.ten_danh_muc as category',
                DB::raw('SUM(spa_hoa_don_chi_tiet.so_luong) as uses'),
                DB::raw('SUM(spa_hoa_don_chi_tiet.thanh_tien) as revenue'),
                DB::raw('AVG(spa_dich_vu.thoi_gian_thuc_hien) as avgTime'),
                DB::raw('ROUND(((SUM(spa_hoa_don_chi_tiet.thanh_tien) - COALESCE(SUM(spa_hoa_don_chi_tiet.thanh_tien * 0.3), 0)) / SUM(spa_hoa_don_chi_tiet.thanh_tien) * 100), 1) as growth')
            )
            ->groupBy('spa_dich_vu.id', 'spa_dich_vu.ten_dich_vu', 'spa_danh_muc_dich_vu.ten_danh_muc')
            ->orderBy('revenue', 'desc')
            ->get();

        $categories = DB::table('spa_hoa_don_chi_tiet')
            ->join('spa_hoa_don', 'spa_hoa_don_chi_tiet.hoa_don_id', '=', 'spa_hoa_don.id')
            ->join('spa_dich_vu', 'spa_hoa_don_chi_tiet.dich_vu_id', '=', 'spa_dich_vu.id')
            ->join('spa_danh_muc_dich_vu', 'spa_dich_vu.danh_muc_id', '=', 'spa_danh_muc_dich_vu.id')
            ->whereBetween('spa_hoa_don.ngay_ban', [$startDate, $endDate])
            ->where('spa_hoa_don.trang_thai', 'da_thanh_toan')
            ->select(
                'spa_danh_muc_dich_vu.ten_danh_muc as category',
                DB::raw('COUNT(DISTINCT spa_dich_vu.id) as count'),
                DB::raw('SUM(spa_hoa_don_chi_tiet.thanh_tien) as revenue')
            )
            ->groupBy('spa_danh_muc_dich_vu.id', 'spa_danh_muc_dich_vu.ten_danh_muc')
            ->get();

        return [
            'services' => $services,
            'categories' => $categories
        ];
    }

    public function getCustomerAnalytics($params = [])
    {
        $startDate = $params['tu_ngay'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $params['den_ngay'] ?? now()->endOfMonth()->format('Y-m-d');

        $topCustomers = DB::table('spa_hoa_don')
            ->join('users', 'spa_hoa_don.khach_hang_id', '=', 'users.id')
            ->whereBetween('spa_hoa_don.ngay_ban', [$startDate, $endDate])
            ->where('spa_hoa_don.trang_thai', 'da_thanh_toan')
            ->select(
                'users.name',
                DB::raw('COUNT(spa_hoa_don.id) as visits'),
                DB::raw('SUM(spa_hoa_don.tong_thanh_toan) as spent'),
                DB::raw('MAX(spa_hoa_don.ngay_ban) as lastVisit')
            )
            ->groupBy('users.id', 'users.name')
            ->orderBy('spent', 'desc')
            ->limit(10)
            ->get();

        $customerTrend = DB::table('users')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as new')
            )
            ->whereYear('created_at', '>=', now()->subMonths(6)->year)
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->orderBy('month')
            ->get();

        $totalCustomers = User::count();
        $newThisMonth = User::whereBetween('created_at', [now()->startOfMonth(), now()])->count();
        $avgSpent = DB::table('spa_hoa_don')
            ->where('trang_thai', 'da_thanh_toan')
            ->avg('tong_thanh_toan');

        return [
            'topCustomers' => $topCustomers,
            'customerTrend' => $customerTrend,
            'totalCustomers' => $totalCustomers,
            'newThisMonth' => $newThisMonth,
            'avgSpent' => $avgSpent
        ];
    }

    public function getScheduleAnalytics($params = [])
    {
        $startDate = $params['tu_ngay'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $params['den_ngay'] ?? now()->endOfMonth()->format('Y-m-d');

        $roomUsage = DB::table('spa_bookings')
            ->join('spa_phong', 'spa_bookings.phong_id', '=', 'spa_phong.id')
            ->whereBetween('spa_bookings.ngay_hen', [$startDate, $endDate])
            ->select(
                'spa_phong.ten_phong as room',
                DB::raw('COUNT(*) as hours'),
                DB::raw('ROUND(COUNT(*) / 240 * 100, 0) as `usage`')
            )
            ->groupBy('spa_phong.id', 'spa_phong.ten_phong')
            ->get();

        return [
            'roomUsage' => $roomUsage
        ];
    }

    public function getStaffAnalytics($params = [])
    {
        $startDate = $params['tu_ngay'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $params['den_ngay'] ?? now()->endOfMonth()->format('Y-m-d');

        $staffPerformance = DB::table('spa_ktv_hoa_hong')
            ->join('spa_ktv', 'spa_ktv_hoa_hong.ktv_id', '=', 'spa_ktv.id')
            ->join('admin_users', 'spa_ktv.admin_user_id', '=', 'admin_users.id')
            ->whereBetween('spa_ktv_hoa_hong.thang', [$startDate, $endDate])
            ->select(
                'admin_users.name',
                DB::raw('COUNT(DISTINCT spa_ktv_hoa_hong.hoa_don_id) as services'),
                DB::raw('SUM(spa_ktv_hoa_hong.gia_tri_goc) as revenue'),
                DB::raw('4.8 as rating'),
                DB::raw('\'["Massage", "Chăm sóc da"]\' as skills')
            )
            ->groupBy('spa_ktv.id', 'admin_users.name')
            ->orderBy('revenue', 'desc')
            ->get();

        return [
            'staffPerformance' => $staffPerformance
        ];
    }

    public function getInventoryAnalytics($params = [])
    {
        $inventory = DB::table('spa_ton_kho_chi_nhanh')
            ->join('spa_san_pham', 'spa_ton_kho_chi_nhanh.san_pham_id', '=', 'spa_san_pham.id')
            ->select(
                'spa_san_pham.ten_san_pham as name',
                DB::raw('ROUND((spa_ton_kho_chi_nhanh.so_luong_dat_truoc / NULLIF(spa_ton_kho_chi_nhanh.so_luong_ton, 0) * 100), 0) as `used`'),
                'spa_ton_kho_chi_nhanh.so_luong_ton as stock',
                DB::raw('ROUND(spa_ton_kho_chi_nhanh.gia_tri_ton_kho, 0) as cost')
            )
            ->where('spa_ton_kho_chi_nhanh.so_luong_ton', '>', 0)
            ->orderBy('stock', 'desc')
            ->limit(10)
            ->get();

        return [
            'inventory' => $inventory
        ];
    }

    public function getPackageAnalytics($params = [])
    {
        $startDate = $params['tu_ngay'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $params['den_ngay'] ?? now()->endOfMonth()->format('Y-m-d');

        $packages = DB::table('spa_customer_packages')
            ->join('spa_goi_dich_vu', 'spa_customer_packages.goi_dich_vu_id', '=', 'spa_goi_dich_vu.id')
            ->whereBetween('spa_customer_packages.ngay_mua', [$startDate, $endDate])
            ->select(
                'spa_goi_dich_vu.ten_goi as name',
                DB::raw('COUNT(*) as sold'),
                DB::raw('ROUND(AVG((spa_customer_packages.so_luong_da_dung / NULLIF(spa_customer_packages.so_luong_tong, 0) * 100)), 0) as `used`'),
                DB::raw('SUM(spa_customer_packages.gia_mua) as revenue')
            )
            ->groupBy('spa_goi_dich_vu.id', 'spa_goi_dich_vu.ten_goi')
            ->orderBy('revenue', 'desc')
            ->get();

        return [
            'packages' => $packages
        ];
    }

    public function getFeedbackAnalytics($params = [])
    {
        $startDate = $params['tu_ngay'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $params['den_ngay'] ?? now()->endOfMonth()->format('Y-m-d');

        $serviceRatings = DB::table('spa_danh_gia')
            ->join('spa_dich_vu', 'spa_danh_gia.dich_vu_id', '=', 'spa_dich_vu.id')
            ->whereBetween('spa_danh_gia.created_at', [$startDate, $endDate])
            ->whereNotNull('spa_danh_gia.dich_vu_id')
            ->select(
                'spa_dich_vu.ten_dich_vu as service',
                DB::raw('ROUND(AVG(spa_danh_gia.so_sao), 1) as rating'),
                DB::raw('COUNT(*) as reviews')
            )
            ->groupBy('spa_dich_vu.id', 'spa_dich_vu.ten_dich_vu')
            ->orderBy('rating', 'desc')
            ->get();

        $totalReviews = DB::table('spa_danh_gia')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $avgRating = DB::table('spa_danh_gia')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->avg('so_sao');

        $satisfactionRate = $totalReviews > 0
            ? DB::table('spa_danh_gia')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('so_sao', '>=', 4)
                ->count() / $totalReviews * 100
            : 0;

        return [
            'serviceRatings' => $serviceRatings,
            'avgRating' => round($avgRating ?? 0, 2),
            'satisfactionRate' => round($satisfactionRate, 0)
        ];
    }

    public function getGrowthAnalytics($params = [])
    {
        $thisMonth = now()->format('Y-m');
        $lastMonth = now()->subMonth()->format('Y-m');

        $thisMonthRevenue = DB::table('spa_hoa_don')
            ->where('trang_thai', 'da_thanh_toan')
            ->whereRaw('DATE_FORMAT(ngay_ban, "%Y-%m") = ?', [$thisMonth])
            ->sum('tong_thanh_toan');

        $lastMonthRevenue = DB::table('spa_hoa_don')
            ->where('trang_thai', 'da_thanh_toan')
            ->whereRaw('DATE_FORMAT(ngay_ban, "%Y-%m") = ?', [$lastMonth])
            ->sum('tong_thanh_toan');

        $thisMonthCustomers = User::whereRaw('DATE_FORMAT(created_at, "%Y-%m") = ?', [$thisMonth])->count();
        $lastMonthCustomers = User::whereRaw('DATE_FORMAT(created_at, "%Y-%m") = ?', [$lastMonth])->count();

        $thisMonthBookings = DB::table('spa_bookings')
            ->whereRaw('DATE_FORMAT(ngay_hen, "%Y-%m") = ?', [$thisMonth])
            ->count();

        $lastMonthBookings = DB::table('spa_bookings')
            ->whereRaw('DATE_FORMAT(ngay_hen, "%Y-%m") = ?', [$lastMonth])
            ->count();

        $trend = DB::select("
            SELECT
                DATE_FORMAT(ngay_ban, '%Y-%m') as `year_month`,
                SUM(tong_thanh_toan) / 1000000 as `value`
            FROM spa_hoa_don
            WHERE trang_thai = 'da_thanh_toan'
                AND YEAR(ngay_ban) >= ?
            GROUP BY DATE_FORMAT(ngay_ban, '%Y-%m')
            ORDER BY `year_month` ASC
        ", [now()->subMonths(6)->year]);

        return [
            'comparison' => [
                [
                    'metric' => 'Doanh thu',
                    'thisMonth' => $thisMonthRevenue,
                    'lastMonth' => $lastMonthRevenue,
                    'growth' => $lastMonthRevenue > 0 ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1) : 0
                ],
                [
                    'metric' => 'Khách hàng',
                    'thisMonth' => $thisMonthCustomers,
                    'lastMonth' => $lastMonthCustomers,
                    'growth' => $lastMonthCustomers > 0 ? round((($thisMonthCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100, 1) : 0
                ],
                [
                    'metric' => 'Lịch hẹn',
                    'thisMonth' => $thisMonthBookings,
                    'lastMonth' => $lastMonthBookings,
                    'growth' => $lastMonthBookings > 0 ? round((($thisMonthBookings - $lastMonthBookings) / $lastMonthBookings) * 100, 1) : 0
                ]
            ],
            'trend' => $trend
        ];
    }
}
