<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Whmcs\AnalyticsService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get dashboard overview
     */
    public function overview(Request $request)
    {
        try {
            $params = [
                'start_date' => $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth(),
                'end_date' => $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth(),
                'compare_start' => $request->compare_start ? Carbon::parse($request->compare_start) : now()->subMonth()->startOfMonth(),
                'compare_end' => $request->compare_end ? Carbon::parse($request->compare_end) : now()->subMonth()->endOfMonth(),
            ];

            $revenue = $this->analyticsService->getRevenueOverview($params);
            $serviceStats = $this->analyticsService->getServiceStats();
            $invoiceStats = $this->analyticsService->getInvoiceStats();
            $aov = $this->analyticsService->getAverageOrderValue($params);
            $ltv = $this->analyticsService->getCustomerLifetimeValue();

            return response()->json([
                'success' => true,
                'data' => [
                    'revenue' => $revenue,
                    'services' => $serviceStats,
                    'invoices' => $invoiceStats,
                    'average_order_value' => $aov,
                    'customer_lifetime_value' => $ltv,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch overview: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get revenue chart data
     */
    public function revenue(Request $request)
    {
        try {
            $period = $request->period ?? 'daily';
            $days = $request->days ?? 30;

            $data = $this->analyticsService->getRevenueByPeriod($period, $days);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch revenue data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get top customers
     */
    public function topCustomers(Request $request)
    {
        try {
            $limit = $request->limit ?? 10;
            $data = $this->analyticsService->getTopCustomers($limit);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top customers: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get churn rate
     */
    public function churnRate(Request $request)
    {
        try {
            $months = $request->months ?? 6;
            $data = $this->analyticsService->getChurnRate($months);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch churn rate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment method statistics
     */
    public function paymentMethods(Request $request)
    {
        try {
            $data = $this->analyticsService->getPaymentMethodStats();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment methods: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer growth
     */
    public function customerGrowth(Request $request)
    {
        try {
            $months = $request->months ?? 12;
            $data = $this->analyticsService->getCustomerGrowth($months);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer growth: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get product performance
     */
    public function productPerformance(Request $request)
    {
        try {
            $data = $this->analyticsService->getProductPerformance();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product performance: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export analytics data
     */
    public function export(Request $request)
    {
        try {
            $type = $request->type ?? 'revenue';
            $params = $request->all();

            $csv = $this->analyticsService->exportData($type, $params);

            $filename = "whmcs_analytics_{$type}_" . now()->format('Y-m-d') . ".csv";

            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
