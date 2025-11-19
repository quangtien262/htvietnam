<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Admin\HoaDon;
use App\Models\Admin\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SpaReportController extends Controller
{
    /**
     * Báo cáo doanh thu
     */
    public function getRevenueReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'group_by' => 'sometimes|in:day,week,month',
            'branch_id' => 'sometimes|integer',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();
        $groupBy = $request->group_by ?? 'day';
        $branchId = $request->branch_id;

        // Query base
        $query = HoaDon::whereBetween('created_at', [$startDate, $endDate])
            ->where('is_draft', 0)
            ->where('is_recycle_bin', 0);
        
        if ($branchId) {
            $query->where('chi_nhanh_id', $branchId);
        }

        // Group by date format
        $dateFormat = match($groupBy) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d'
        };

        $report = $query->select(
            DB::raw("DATE_FORMAT(created_at, '$dateFormat') as date"),
            DB::raw('SUM(tong_tien) as revenue'),
            DB::raw('COUNT(DISTINCT users_id) as customers'),
            DB::raw('COUNT(*) as bookings'),
            DB::raw('0 as services'),  // Update when chi_tiet table is available
            DB::raw('0 as products')   // Update when chi_tiet table is available
        )
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Calculate totals
        $totals = [
            'revenue' => $report->sum('revenue'),
            'customers' => $query->distinct('users_id')->count(),
            'bookings' => $query->count(),
            'avgOrder' => $query->count() > 0 ? $report->sum('revenue') / $query->count() : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'report' => $report,
                'totals' => $totals,
            ]
        ]);
    }

    /**
     * Báo cáo chi tiết giao dịch
     */
    public function getTransactionsReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'branch_id' => 'sometimes|integer',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();
        $branchId = $request->branch_id;

        $query = HoaDon::select(
                'hoa_don.*',
                'users.name as ten_khach_hang'
            )
            ->leftJoin('users', 'users.id', 'hoa_don.users_id')
            ->whereBetween('hoa_don.created_at', [$startDate, $endDate])
            ->where('hoa_don.is_draft', 0)
            ->where('hoa_don.is_recycle_bin', 0);

        if ($branchId) {
            $query->where('hoa_don.chi_nhanh_id', $branchId);
        }

        $transactions = $query->get()->map(function ($hoaDon) {
            return [
                'id' => $hoaDon->id,
                'ma_hoa_don' => $hoaDon->code ?? 'HD-' . $hoaDon->id,
                'ngay_tao' => $hoaDon->created_at,
                'ten_khach_hang' => $hoaDon->ten_khach_hang ?? 'N/A',
                'dich_vu' => 'Dịch vụ', // Update when chi_tiet available
                'tong_tien' => $hoaDon->tong_tien ?? 0,
                'giam_gia' => $hoaDon->giam_gia ?? 0,
                'thanh_toan' => ($hoaDon->tong_tien ?? 0) - ($hoaDon->giam_gia ?? 0),
                'trang_thai' => $hoaDon->status == 1 ? 'hoan_thanh' : 'chua_hoan_thanh',
            ];
        });

        $totals = [
            'revenue' => $transactions->sum('thanh_toan'),
            'customers' => $transactions->pluck('ten_khach_hang')->unique()->count(),
            'bookings' => $transactions->count(),
            'avgOrder' => $transactions->count() > 0 ? $transactions->sum('thanh_toan') / $transactions->count() : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'transactions' => $transactions,
                'totals' => $totals,
            ]
        ]);
    }

    /**
     * Báo cáo nhân viên
     */
    public function getStaffReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'branch_id' => 'sometimes|integer',
        ]);

        // Sample data - replace with actual staff performance tracking
        $staffReport = [
            [
                'id' => 1,
                'ten_nhan_vien' => 'Nguyễn Văn A',
                'so_khach' => 25,
                'doanh_thu' => 15000000,
                'hoa_hong' => 1500000,
                'diem_danh_gia' => 4.8,
            ],
            [
                'id' => 2,
                'ten_nhan_vien' => 'Trần Thị B',
                'so_khach' => 30,
                'doanh_thu' => 18000000,
                'hoa_hong' => 1800000,
                'diem_danh_gia' => 4.9,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'staff' => $staffReport,
            ]
        ]);
    }

    /**
     * Báo cáo tồn kho
     */
    public function getInventoryReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'branch_id' => 'sometimes|integer',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();
        $branchId = $request->branch_id;

        $query = Product::query();

        if ($branchId) {
            $query->where('chi_nhanh_id', $branchId);
        }

        $inventory = $query->take(20)->get()->map(function ($product) use ($startDate, $endDate) {
            // Simulate inventory data - you should replace with actual inventory tracking
            return [
                'id' => $product->id,
                'ten_san_pham' => $product->ten_san_pham,
                'ton_dau_ky' => 100, // Replace with actual data
                'nhap' => 50,        // Replace with actual data
                'xuat' => 30,        // Replace with actual data
                'ton_cuoi_ky' => 120, // Replace with actual data
                'gia_tri_ton' => 120 * ($product->gia_ban ?? 0),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'inventory' => $inventory,
            ]
        ]);
    }

    /**
     * Export báo cáo (Excel/PDF)
     */
    public function exportReport(Request $request)
    {
        $request->validate([
            'type' => 'required|in:revenue,transactions,staff,inventory',
            'format' => 'required|in:excel,pdf',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        // Get report data based on type
        $reportData = match($request->type) {
            'revenue' => $this->getRevenueReport($request)->getData()->data,
            'transactions' => $this->getTransactionsReport($request)->getData()->data,
            'staff' => $this->getStaffReport($request)->getData()->data,
            'inventory' => $this->getInventoryReport($request)->getData()->data,
        };

        // TODO: Implement actual Excel/PDF export
        // For now, return JSON
        return response()->json([
            'success' => true,
            'message' => 'Export functionality will be implemented',
            'data' => $reportData
        ]);
    }
}
