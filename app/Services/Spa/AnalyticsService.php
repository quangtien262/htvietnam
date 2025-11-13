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
            return [
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
}
