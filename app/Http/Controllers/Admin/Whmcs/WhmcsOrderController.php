<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsOrder;
use App\Services\Admin\WhmcsOrderService;
use Illuminate\Http\Request;

class WhmcsOrderController extends Controller
{
    protected $service;

    public function __construct(WhmcsOrderService $service)
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

            $query = WhmcsOrder::with(['client', 'items.product', 'invoice']);

            if ($search) {
                $query->where('order_number', 'like', "%{$search}%");
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($clientId) {
                $query->where('client_id', $clientId);
            }

            $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders
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
            $order = WhmcsOrder::with([
                'client',
                'items.product',
                'invoice',
                'promoCode'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function apiAdd(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|exists:whmcs_clients,id',
                'currency_id' => 'required|exists:whmcs_currencies,id',
                'items' => 'required|array',
                'items.*.product_id' => 'required|exists:whmcs_products,id',
                'items.*.billing_cycle' => 'required|string',
                'items.*.quantity' => 'integer|min:1',
                'promo_code' => 'nullable|string',
                'payment_method' => 'nullable|string',
                'notes' => 'nullable|string'
            ]);

            $order = $this->service->createOrder($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdateStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:Pending,Active,Cancelled,Fraud'
            ]);

            $order = WhmcsOrder::findOrFail($id);
            $result = $this->service->updateOrderStatus($order, $validated['status']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái đơn hàng thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDelete($id)
    {
        try {
            $order = WhmcsOrder::findOrFail($id);

            if ($order->status == 'Active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa đơn hàng đang hoạt động'
                ], 400);
            }

            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa đơn hàng thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
