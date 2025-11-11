<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsClient;
use App\Models\Whmcs\WhmcsInvoice;
use App\Models\Whmcs\WhmcsService;
use App\Models\Whmcs\WhmcsOrder;
use App\Models\Whmcs\WhmcsTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WhmcsReportController extends Controller
{
    public function apiDashboard()
    {
        try {
            $stats = [
                'total_clients' => WhmcsClient::count(),
                'active_clients' => WhmcsClient::where('status', 'Active')->count(),
                'total_services' => WhmcsService::count(),
                'active_services' => WhmcsService::where('status', 'Active')->count(),
                'total_invoices' => WhmcsInvoice::count(),
                'unpaid_invoices' => WhmcsInvoice::where('status', 'Unpaid')->count(),
                'overdue_invoices' => WhmcsInvoice::where('status', 'Unpaid')
                    ->where('due_date', '<', now())
                    ->count(),
                'total_revenue' => WhmcsInvoice::where('status', 'Paid')->sum('total'),
                'revenue_this_month' => WhmcsInvoice::where('status', 'Paid')
                    ->whereMonth('date_paid', now()->month)
                    ->whereYear('date_paid', now()->year)
                    ->sum('total'),
                'pending_orders' => WhmcsOrder::where('status', 'Pending')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiRevenue(Request $request)
    {
        try {
            $startDate = $request->input('start_date', now()->subMonths(6)->startOfMonth());
            $endDate = $request->input('end_date', now()->endOfMonth());
            $groupBy = $request->input('group_by', 'month'); // day, month, year

            $query = WhmcsInvoice::where('status', 'Paid')
                ->whereBetween('date_paid', [$startDate, $endDate]);

            switch ($groupBy) {
                case 'day':
                    $revenue = $query->selectRaw('DATE(date_paid) as period, SUM(total) as total')
                        ->groupBy('period')
                        ->get();
                    break;
                case 'year':
                    $revenue = $query->selectRaw('YEAR(date_paid) as period, SUM(total) as total')
                        ->groupBy('period')
                        ->get();
                    break;
                default: // month
                    $revenue = $query->selectRaw('DATE_FORMAT(date_paid, "%Y-%m") as period, SUM(total) as total')
                        ->groupBy('period')
                        ->get();
                    break;
            }

            return response()->json([
                'success' => true,
                'data' => $revenue
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiClientsGrowth(Request $request)
    {
        try {
            $startDate = $request->input('start_date', now()->subMonths(12)->startOfMonth());
            $endDate = $request->input('end_date', now()->endOfMonth());

            $growth = WhmcsClient::whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as period, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $growth
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiServicesStatistics()
    {
        try {
            $stats = [
                'by_status' => WhmcsService::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get(),
                'by_product' => WhmcsService::join('whmcs_products', 'whmcs_services.product_id', '=', 'whmcs_products.id')
                    ->select('whmcs_products.name', DB::raw('count(*) as count'))
                    ->groupBy('whmcs_products.id', 'whmcs_products.name')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->get(),
                'by_billing_cycle' => WhmcsService::select('billing_cycle', DB::raw('count(*) as count'))
                    ->groupBy('billing_cycle')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
