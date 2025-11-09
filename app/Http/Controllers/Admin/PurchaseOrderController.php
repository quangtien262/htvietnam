<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseOrderStatus;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    /**
     * Get list of purchase orders
     */
    public function apiList(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $pageSize = $request->input('pageSize', 20);
            $search = $request->input('search', '');
            $status = $request->input('status');
            $supplierId = $request->input('supplier_id');
            $paymentStatus = $request->input('payment_status');

            $query = PurchaseOrder::with(['supplier', 'items'])
                ->where('is_recycle_bin', 0);

            // Search
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('code', 'LIKE', "%{$search}%")
                      ->orWhere('notes', 'LIKE', "%{$search}%")
                      ->orWhereHas('supplier', function($sq) use ($search) {
                          $sq->where('name', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filters
            if ($status !== null && $status !== '') {
                $query->where('status', $status);
            }
            if ($supplierId) {
                $query->where('supplier_id', $supplierId);
            }
            if ($paymentStatus !== null && $paymentStatus !== '') {
                $query->where('payment_status', $paymentStatus);
            }

            $total = $query->count();

            $data = $query->orderBy('order_date', 'DESC')
                ->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->get();

            return response()->json([
                'status_code' => 200,
                'data' => $data,
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get order detail
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->input('id');
            $order = PurchaseOrder::with(['supplier', 'items', 'stockReceipts', 'payments'])->find($id);

            if (!$order) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy đơn hàng'
                ]);
            }

            return response()->json([
                'status_code' => 200,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Create new purchase order
     */
    public function apiAdd(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->except('items');

            // Generate order code
            $lastOrder = PurchaseOrder::orderBy('id', 'DESC')->first();
            $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
            $data['code'] = 'PO' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

            $order = PurchaseOrder::create($data);

            // Add items
            $items = $request->input('items', []);
            $totalAmount = 0;

            foreach ($items as $item) {
                $amount = $item['quantity'] * $item['unit_price'];
                $amount = $amount * (1 + $item['tax_rate'] / 100);
                $amount = $amount * (1 - ($item['discount_rate'] ?? 0) / 100);

                $item['amount'] = $amount;
                $item['purchase_order_id'] = $order->id;

                PurchaseOrderItem::create($item);
                $totalAmount += $amount;
            }

            // Update order totals
            $order->update([
                'total_amount' => $totalAmount,
                'grand_total' => $totalAmount + $order->tax - $order->discount
            ]);

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Tạo đơn hàng thành công',
                'data' => $order->load('items')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update purchase order
     */
    public function apiUpdate(Request $request)
    {
        DB::beginTransaction();
        try {
            $id = $request->input('id');
            $order = PurchaseOrder::find($id);

            if (!$order) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy đơn hàng'
                ]);
            }

            // Update order
            $order->update($request->except(['id', 'code', 'items']));

            // Update items if provided
            if ($request->has('items')) {
                // Delete old items
                PurchaseOrderItem::where('purchase_order_id', $id)->delete();

                // Add new items
                $items = $request->input('items', []);
                $totalAmount = 0;

                foreach ($items as $item) {
                    $amount = $item['quantity'] * $item['unit_price'];
                    $amount = $amount * (1 + $item['tax_rate'] / 100);
                    $amount = $amount * (1 - ($item['discount_rate'] ?? 0) / 100);

                    $item['amount'] = $amount;
                    $item['purchase_order_id'] = $order->id;

                    PurchaseOrderItem::create($item);
                    $totalAmount += $amount;
                }

                // Update order totals
                $order->update([
                    'total_amount' => $totalAmount,
                    'grand_total' => $totalAmount + $order->tax - $order->discount
                ]);
            }

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật thành công',
                'data' => $order->load('items')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete purchase order(s)
     */
    public function apiDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Không có dữ liệu để xóa'
                ]);
            }

            PurchaseOrder::whereIn('id', $ids)->update(['is_recycle_bin' => 1]);

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update order status
     */
    public function apiUpdateStatus(Request $request)
    {
        try {
            $id = $request->input('id');
            $status = $request->input('status');

            $order = PurchaseOrder::find($id);
            if (!$order) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy đơn hàng'
                ]);
            }

            $order->update(['status' => $status]);

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật trạng thái thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get statistics
     */
    public function apiStatistics(Request $request)
    {
        try {
            $stats = [
                'total_orders' => PurchaseOrder::where('is_recycle_bin', 0)->count(),
                'draft_orders' => PurchaseOrder::where('is_recycle_bin', 0)->where('status', 'draft')->count(),
                'sent_orders' => PurchaseOrder::where('is_recycle_bin', 0)->where('status', 'sent')->count(),
                'completed_orders' => PurchaseOrder::where('is_recycle_bin', 0)->where('status', 'completed')->count(),
                'total_amount' => PurchaseOrder::where('is_recycle_bin', 0)
                    ->whereIn('status', ['sent', 'receiving', 'completed'])
                    ->sum('grand_total'),
                'unpaid_amount' => PurchaseOrder::where('is_recycle_bin', 0)
                    ->whereIn('payment_status', ['unpaid', 'partial'])
                    ->sum(DB::raw('grand_total - paid_amount')),
            ];

            return response()->json([
                'status_code' => 200,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get supplier list for dropdown
     */
    public function apiSupplierList(Request $request)
    {
        try {
            $suppliers = Supplier::where('is_recycle_bin', 0)
                ->where('status', 1)
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'phone', 'email']);

            return response()->json([
                'status_code' => 200,
                'data' => $suppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get status list
     */
    public function apiStatusList(Request $request)
    {
        $statuses = PurchaseOrderStatus::orderBy('sort_order', 'asc')
            ->get(['value', 'label', 'color'])
            ->toArray();

        return response()->json([
            'status_code' => 200,
            'data' => $statuses
        ]);
    }
}
