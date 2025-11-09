<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    /**
     * Get list of suppliers with pagination and filters
     */
    public function apiList(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $pageSize = $request->input('pageSize', 20);
            $search = $request->input('search', '');
            $status = $request->input('status');

            $query = DB::table('suppliers')
                ->where('is_recycle_bin', 0);

            // Search
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('code', 'LIKE', "%{$search}%")
                      ->orWhere('contact_person', 'LIKE', "%{$search}%")
                      ->orWhere('phone', 'LIKE', "%{$search}%");
                });
            }

            // Filter by status
            if ($status !== null && $status !== '') {
                $query->where('status', $status);
            }

            $total = $query->count();

            $data = $query->orderBy('id', 'DESC')
                ->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->get();

            // Add statistics for each supplier
            foreach ($data as $supplier) {
                $totalOrders = PurchaseOrder::where('supplier_id', $supplier->id)
                    ->whereIn('status', ['sent', 'receiving', 'completed'])
                    ->count();

                $totalAmount = PurchaseOrder::where('supplier_id', $supplier->id)
                    ->whereIn('status', ['sent', 'receiving', 'completed'])
                    ->sum('grand_total');

                $totalPaid = SupplierPayment::where('supplier_id', $supplier->id)
                    ->sum('amount');

                $supplier->total_orders = $totalOrders;
                $supplier->total_amount = $totalAmount;
                $supplier->total_debt = $totalAmount - $totalPaid;
            }

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
     * Get supplier detail
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->input('id');
            $supplier = Supplier::find($id);

            if (!$supplier) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy nhà cung cấp'
                ]);
            }

            return response()->json([
                'status_code' => 200,
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Create new supplier
     */
    public function apiAdd(Request $request)
    {
        try {
            $data = $request->all();

            // Generate supplier code
            $lastSupplier = Supplier::orderBy('id', 'DESC')->first();
            $nextId = $lastSupplier ? $lastSupplier->id + 1 : 1;
            $data['code'] = 'SUP' . str_pad($nextId, 5, '0', STR_PAD_LEFT);

            $supplier = Supplier::create($data);

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm nhà cung cấp thành công',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update supplier
     */
    public function apiUpdate(Request $request)
    {
        try {
            $id = $request->input('id');
            $supplier = Supplier::find($id);

            if (!$supplier) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy nhà cung cấp'
                ]);
            }

            $supplier->update($request->except(['id', 'code']));

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật thành công',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete supplier(s)
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

            Supplier::whereIn('id', $ids)->update(['is_recycle_bin' => 1]);

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
     * Get supplier statistics
     */
    public function apiStatistics(Request $request)
    {
        try {
            $stats = [
                'total_suppliers' => Supplier::where('is_recycle_bin', 0)->count(),
                'active_suppliers' => Supplier::where('is_recycle_bin', 0)->where('status', 1)->count(),
                'inactive_suppliers' => Supplier::where('is_recycle_bin', 0)->where('status', 0)->count(),
                'total_debt' => DB::table('purchase_orders')
                    ->whereIn('status', ['sent', 'receiving', 'completed'])
                    ->sum('grand_total') - DB::table('supplier_payments')->sum('amount'),
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
     * Get supplier purchase history
     */
    public function apiPurchaseHistory(Request $request)
    {
        try {
            $supplierId = $request->input('supplier_id');

            $orders = PurchaseOrder::with('items')
                ->where('supplier_id', $supplierId)
                ->where('is_recycle_bin', 0)
                ->orderBy('order_date', 'DESC')
                ->get();

            return response()->json([
                'status_code' => 200,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get supplier payment history
     */
    public function apiPaymentHistory(Request $request)
    {
        try {
            $supplierId = $request->input('supplier_id');

            $payments = SupplierPayment::with('purchaseOrder')
                ->where('supplier_id', $supplierId)
                ->where('is_recycle_bin', 0)
                ->orderBy('payment_date', 'DESC')
                ->get();

            return response()->json([
                'status_code' => 200,
                'data' => $payments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ]);
        }
    }
}
