<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupplierPayment;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierPaymentController extends Controller
{
    /**
     * Danh sách thanh toán
     */
    public function apiList(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $pageSize = $request->input('pageSize', 20);
            $search = $request->input('search', '');
            $supplierId = $request->input('supplier_id');
            $purchaseOrderId = $request->input('purchase_order_id');
            $paymentMethod = $request->input('payment_method');
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $query = SupplierPayment::with(['supplier', 'purchaseOrder'])
                ->where('is_recycle_bin', 0);

            // Tìm kiếm theo mã thanh toán, tên NCC
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%")
                        ->orWhereHas('supplier', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Lọc theo NCC
            if ($supplierId) {
                $query->where('supplier_id', $supplierId);
            }

            // Lọc theo đơn hàng
            if ($purchaseOrderId) {
                $query->where('purchase_order_id', $purchaseOrderId);
            }

            // Lọc theo phương thức thanh toán
            if ($paymentMethod) {
                $query->where('payment_method', $paymentMethod);
            }

            // Lọc theo ngày
            if ($fromDate) {
                $query->whereDate('payment_date', '>=', $fromDate);
            }
            if ($toDate) {
                $query->whereDate('payment_date', '<=', $toDate);
            }

            // Sắp xếp
            $query->orderBy('payment_date', 'desc')->orderBy('id', 'desc');

            // Phân trang
            $total = $query->count();
            $data = $query->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy danh sách thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chi tiết thanh toán
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->input('id');

            $payment = SupplierPayment::with(['supplier', 'purchaseOrder'])
                ->find($id);

            if (!$payment || $payment->is_recycle_bin == 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy thanh toán'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy chi tiết thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thêm thanh toán
     */
    public function apiAdd(Request $request)
    {
        DB::beginTransaction();
        try {
            $supplierId = $request->input('supplier_id');
            $purchaseOrderId = $request->input('purchase_order_id');
            $paymentDate = $request->input('payment_date');
            $amount = $request->input('amount');
            $paymentMethod = $request->input('payment_method');
            $referenceNumber = $request->input('reference_number');
            $notes = $request->input('notes');

            // Kiểm tra NCC
            $supplier = Supplier::find($supplierId);
            if (!$supplier) {
                throw new \Exception('Không tìm thấy nhà cung cấp');
            }

            // Kiểm tra đơn hàng (nếu có)
            if ($purchaseOrderId) {
                $purchaseOrder = PurchaseOrder::find($purchaseOrderId);
                if (!$purchaseOrder) {
                    throw new \Exception('Không tìm thấy đơn mua hàng');
                }

                // Kiểm tra số tiền thanh toán không vượt quá công nợ
                $remainingDebt = $purchaseOrder->grand_total - $purchaseOrder->paid_amount;
                if ($amount > $remainingDebt) {
                    throw new \Exception('Số tiền thanh toán vượt quá công nợ còn lại');
                }
            }

            // Tạo mã thanh toán tự động
            $lastPayment = SupplierPayment::orderBy('id', 'desc')->first();
            $newId = $lastPayment ? $lastPayment->id + 1 : 1;
            $code = 'PAY' . str_pad($newId, 5, '0', STR_PAD_LEFT);

            // Tạo thanh toán
            $payment = SupplierPayment::create([
                'code' => $code,
                'supplier_id' => $supplierId,
                'purchase_order_id' => $purchaseOrderId,
                'payment_date' => $paymentDate,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'reference_number' => $referenceNumber,
                'notes' => $notes,
                'is_recycle_bin' => 0
            ]);

            // Cập nhật paid_amount cho đơn hàng
            if ($purchaseOrderId) {
                $purchaseOrder = PurchaseOrder::find($purchaseOrderId);
                $purchaseOrder->paid_amount += $amount;

                // Cập nhật trạng thái thanh toán
                if ($purchaseOrder->paid_amount >= $purchaseOrder->grand_total) {
                    $purchaseOrder->payment_status = 'paid';
                } elseif ($purchaseOrder->paid_amount > 0) {
                    $purchaseOrder->payment_status = 'partial';
                } else {
                    $purchaseOrder->payment_status = 'unpaid';
                }

                $purchaseOrder->save();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thanh toán thành công',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật thanh toán
     */
    public function apiUpdate(Request $request)
    {
        DB::beginTransaction();
        try {
            $id = $request->input('id');
            $paymentDate = $request->input('payment_date');
            $amount = $request->input('amount');
            $paymentMethod = $request->input('payment_method');
            $referenceNumber = $request->input('reference_number');
            $notes = $request->input('notes');

            $payment = SupplierPayment::find($id);
            if (!$payment || $payment->is_recycle_bin == 1) {
                throw new \Exception('Không tìm thấy thanh toán');
            }

            $oldAmount = $payment->amount;
            $purchaseOrderId = $payment->purchase_order_id;

            // Cập nhật thanh toán
            $payment->payment_date = $paymentDate;
            $payment->amount = $amount;
            $payment->payment_method = $paymentMethod;
            $payment->reference_number = $referenceNumber;
            $payment->notes = $notes;
            $payment->save();

            // Cập nhật lại paid_amount cho đơn hàng
            if ($purchaseOrderId) {
                $purchaseOrder = PurchaseOrder::find($purchaseOrderId);
                $purchaseOrder->paid_amount = $purchaseOrder->paid_amount - $oldAmount + $amount;

                // Cập nhật trạng thái thanh toán
                if ($purchaseOrder->paid_amount >= $purchaseOrder->grand_total) {
                    $purchaseOrder->payment_status = 'paid';
                } elseif ($purchaseOrder->paid_amount > 0) {
                    $purchaseOrder->payment_status = 'partial';
                } else {
                    $purchaseOrder->payment_status = 'unpaid';
                }

                $purchaseOrder->save();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thanh toán thành công',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa thanh toán
     */
    public function apiDelete(Request $request)
    {
        DB::beginTransaction();
        try {
            $id = $request->input('id');

            $payment = SupplierPayment::find($id);
            if (!$payment || $payment->is_recycle_bin == 1) {
                throw new \Exception('Không tìm thấy thanh toán');
            }

            $amount = $payment->amount;
            $purchaseOrderId = $payment->purchase_order_id;

            // Soft delete
            $payment->is_recycle_bin = 1;
            $payment->save();

            // Cập nhật lại paid_amount cho đơn hàng
            if ($purchaseOrderId) {
                $purchaseOrder = PurchaseOrder::find($purchaseOrderId);
                $purchaseOrder->paid_amount -= $amount;

                // Cập nhật trạng thái thanh toán
                if ($purchaseOrder->paid_amount >= $purchaseOrder->grand_total) {
                    $purchaseOrder->payment_status = 'paid';
                } elseif ($purchaseOrder->paid_amount > 0) {
                    $purchaseOrder->payment_status = 'partial';
                } else {
                    $purchaseOrder->payment_status = 'unpaid';
                }

                $purchaseOrder->save();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thanh toán thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lịch sử thanh toán theo NCC
     */
    public function apiPaymentsBySupplier(Request $request)
    {
        try {
            $supplierId = $request->input('supplier_id');

            $payments = SupplierPayment::with('purchaseOrder')
                ->where('supplier_id', $supplierId)
                ->where('is_recycle_bin', 0)
                ->orderBy('payment_date', 'desc')
                ->get();

            $totalPaid = $payments->sum('amount');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'payments' => $payments,
                    'total_paid' => $totalPaid
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy lịch sử thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thanh toán theo đơn hàng
     */
    public function apiPaymentsByOrder(Request $request)
    {
        try {
            $purchaseOrderId = $request->input('purchase_order_id');

            $payments = SupplierPayment::with('supplier')
                ->where('purchase_order_id', $purchaseOrderId)
                ->where('is_recycle_bin', 0)
                ->orderBy('payment_date', 'desc')
                ->get();

            $totalPaid = $payments->sum('amount');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'payments' => $payments,
                    'total_paid' => $totalPaid
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê thanh toán
     */
    public function apiStatistics(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $query = SupplierPayment::where('is_recycle_bin', 0);

            if ($fromDate) {
                $query->whereDate('payment_date', '>=', $fromDate);
            }
            if ($toDate) {
                $query->whereDate('payment_date', '<=', $toDate);
            }

            $totalPayments = $query->count();
            $totalAmount = $query->sum('amount');

            // Thống kê theo phương thức thanh toán
            $byMethod = SupplierPayment::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('payment_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('payment_date', '<=', $toDate);
                })
                ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('payment_method')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_payments' => $totalPayments,
                    'total_amount' => $totalAmount,
                    'by_method' => $byMethod
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy thống kê: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Danh sách NCC cho dropdown
     */
    public function apiSupplierList(Request $request)
    {
        try {
            $suppliers = Supplier::where('is_recycle_bin', 0)
                ->where('status', 1)
                ->orderBy('name', 'asc')
                ->get(['id', 'code', 'name']);

            return response()->json([
                'status' => 'success',
                'data' => $suppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy danh sách NCC: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Danh sách đơn hàng chưa thanh toán hết theo NCC
     */
    public function apiUnpaidOrdersBySupplier(Request $request)
    {
        try {
            $supplierId = $request->input('supplier_id');

            $orders = PurchaseOrder::where('supplier_id', $supplierId)
                ->where('is_recycle_bin', 0)
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->orderBy('order_date', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }
}
