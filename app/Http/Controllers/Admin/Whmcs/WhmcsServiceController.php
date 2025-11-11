<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsService;
use App\Services\Admin\WhmcsServiceService;
use Illuminate\Http\Request;

class WhmcsServiceController extends Controller
{
    protected $service;

    public function __construct(WhmcsServiceService $service)
    {
        $this->service = $service;
    }

    public function apiList(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $status = $request->input('status', '');
            $clientId = $request->input('client_id', '');
            $productId = $request->input('product_id', '');

            $query = WhmcsService::with(['client', 'product', 'orderItem']);

            if ($search) {
                $query->where('domain', 'like', "%{$search}%");
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($clientId) {
                $query->where('client_id', $clientId);
            }

            if ($productId) {
                $query->where('product_id', $productId);
            }

            $services = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDetail($id)
    {
        try {
            $service = WhmcsService::with([
                'client',
                'product',
                'orderItem',
                'addons',
                'fieldValues'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function apiSuspend($id)
    {
        try {
            $service = WhmcsService::findOrFail($id);

            if ($service->status == 'Suspended') {
                return response()->json([
                    'success' => false,
                    'message' => 'Dịch vụ đã bị tạm ngưng'
                ], 400);
            }

            $result = $this->service->suspendService($service);

            return response()->json([
                'success' => true,
                'message' => 'Tạm ngưng dịch vụ thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiUnsuspend($id)
    {
        try {
            $service = WhmcsService::findOrFail($id);

            if ($service->status != 'Suspended') {
                return response()->json([
                    'success' => false,
                    'message' => 'Dịch vụ không ở trạng thái tạm ngưng'
                ], 400);
            }

            $result = $this->service->unsuspendService($service);

            return response()->json([
                'success' => true,
                'message' => 'Kích hoạt lại dịch vụ thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiTerminate($id)
    {
        try {
            $service = WhmcsService::findOrFail($id);

            if ($service->status == 'Terminated') {
                return response()->json([
                    'success' => false,
                    'message' => 'Dịch vụ đã bị hủy'
                ], 400);
            }

            $result = $this->service->terminateService($service);

            return response()->json([
                'success' => true,
                'message' => 'Hủy dịch vụ thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiStatistics()
    {
        try {
            $stats = [
                'total_services' => WhmcsService::count(),
                'active_services' => WhmcsService::where('status', 'Active')->count(),
                'suspended_services' => WhmcsService::where('status', 'Suspended')->count(),
                'terminated_services' => WhmcsService::where('status', 'Terminated')->count(),
                'pending_services' => WhmcsService::where('status', 'Pending')->count(),
                'expiring_soon' => WhmcsService::where('status', 'Active')
                    ->whereBetween('next_due_date', [now(), now()->addDays(30)])
                    ->count()
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
