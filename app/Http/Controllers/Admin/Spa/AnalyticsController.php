<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Services\Spa\AnalyticsService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $dashboard = $service->getDashboard($request->all());
            return response()->json([
                'success' => true,
                'data' => $dashboard,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function revenue(Request $request)
    {
        $validated = $request->validate([
            'tu_ngay' => 'required|date',
            'den_ngay' => 'required|date|after_or_equal:tu_ngay',
            'chi_nhanh_id' => 'nullable|exists:spa_chi_nhanh,id',
        ]);

        try {
            $service = new AnalyticsService();
            $revenue = $service->getRevenue(
                $validated['tu_ngay'],
                $validated['den_ngay'],
                $validated['chi_nhanh_id'] ?? null
            );
            return response()->json([
                'success' => true,
                'data' => $revenue,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function customerSegmentation()
    {
        try {
            $service = new AnalyticsService();
            $segmentation = $service->getCustomerSegmentation();
            return response()->json([
                'success' => true,
                'data' => $segmentation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function exportReport(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:revenue,customer,staff_commission',
            'tu_ngay' => 'required|date',
            'den_ngay' => 'required|date|after_or_equal:tu_ngay',
        ]);

        try {
            $service = new AnalyticsService();
            $report = $service->exportReport(
                $validated['type'],
                $validated['tu_ngay'],
                $validated['den_ngay'],
                $request->all()
            );
            return response()->json([
                'success' => true,
                'data' => $report,
                'message' => 'Xuất báo cáo thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function services(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getServiceAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function customers(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getCustomerAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function schedule(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getScheduleAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function staff(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getStaffAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function inventory(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getInventoryAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function packages(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getPackageAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function feedback(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getFeedbackAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function growth(Request $request)
    {
        try {
            $service = new AnalyticsService();
            $data = $service->getGrowthAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
