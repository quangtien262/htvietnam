<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StockReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockReceiptController extends Controller
{
    /**
     * Danh sách phiếu nhập kho
     */
    public function apiList(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $pageSize = $request->input('pageSize', 20);
            $search = $request->input('search', '');
            $purchaseOrderId = $request->input('purchase_order_id');
            $status = $request->input('status');
            $warehouse = $request->input('warehouse');
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $query = StockReceipt::with(['purchaseOrder.supplier'])
                ->where('is_recycle_bin', 0);

            // Tìm kiếm theo mã phiếu hoặc người nhận
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('received_by', 'like', "%{$search}%")
                        ->orWhereHas('purchaseOrder', function ($q) use ($search) {
                            $q->where('code', 'like', "%{$search}%");
                        });
                });
            }

            // Lọc theo đơn hàng
            if ($purchaseOrderId) {
                $query->where('purchase_order_id', $purchaseOrderId);
            }

            // Lọc theo trạng thái
            if ($status !== null && $status !== '') {
                $query->where('status', $status);
            }

            // Lọc theo kho
            if ($warehouse) {
                $query->where('warehouse', 'like', "%{$warehouse}%");
            }

            // Lọc theo ngày
            if ($fromDate) {
                $query->whereDate('receipt_date', '>=', $fromDate);
            }
            if ($toDate) {
                $query->whereDate('receipt_date', '<=', $toDate);
            }

            // Sắp xếp
            $query->orderBy('receipt_date', 'desc')->orderBy('id', 'desc');

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
                'message' => 'Lỗi khi lấy danh sách phiếu nhập kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chi tiết phiếu nhập kho
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->input('id');

            $receipt = StockReceipt::with([
                'purchaseOrder.supplier',
                'purchaseOrder.items'
            ])->find($id);

            if (!$receipt || $receipt->is_recycle_bin == 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy phiếu nhập kho'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $receipt
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy chi tiết phiếu nhập kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thêm phiếu nhập kho
     */
    public function apiAdd(Request $request)
    {
        DB::beginTransaction();
        try {
            $purchaseOrderId = $request->input('purchase_order_id');
            $receiptDate = $request->input('receipt_date');
            $warehouse = $request->input('warehouse');
            $status = $request->input('status', 1);
            $notes = $request->input('notes');
            $receivedBy = $request->input('received_by');
            $items = $request->input('items', []); // [{item_id, received_quantity}]

            // Kiểm tra đơn hàng
            $purchaseOrder = PurchaseOrder::find($purchaseOrderId);
            if (!$purchaseOrder) {
                throw new \Exception('Không tìm thấy đơn mua hàng');
            }

            // Tạo mã phiếu nhập tự động
            $lastReceipt = StockReceipt::orderBy('id', 'desc')->first();
            $newId = $lastReceipt ? $lastReceipt->id + 1 : 1;
            $code = 'SR' . str_pad($newId, 5, '0', STR_PAD_LEFT);

            // Tạo phiếu nhập kho
            $receipt = StockReceipt::create([
                'code' => $code,
                'purchase_order_id' => $purchaseOrderId,
                'receipt_date' => $receiptDate,
                'warehouse' => $warehouse,
                'status' => $status,
                'notes' => $notes,
                'received_by' => $receivedBy,
                'is_recycle_bin' => 0
            ]);

            // Cập nhật số lượng đã nhận cho từng sản phẩm
            foreach ($items as $item) {
                $itemId = $item['item_id'];
                $receivedQty = $item['received_quantity'];

                $orderItem = PurchaseOrderItem::where('id', $itemId)
                    ->where('purchase_order_id', $purchaseOrderId)
                    ->first();

                if ($orderItem) {
                    $newReceivedQty = $orderItem->received_quantity + $receivedQty;

                    // Không cho phép nhận quá số lượng đặt
                    if ($newReceivedQty > $orderItem->quantity) {
                        throw new \Exception("Số lượng nhận của sản phẩm '{$orderItem->product_name}' vượt quá số lượng đặt");
                    }

                    $orderItem->received_quantity = $newReceivedQty;
                    $orderItem->save();
                }
            }

            // Cập nhật trạng thái đơn hàng
            $this->updatePurchaseOrderStatus($purchaseOrderId);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo phiếu nhập kho thành công',
                'data' => $receipt
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo phiếu nhập kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật phiếu nhập kho
     */
    public function apiUpdate(Request $request)
    {
        DB::beginTransaction();
        try {
            $id = $request->input('id');
            $receiptDate = $request->input('receipt_date');
            $warehouse = $request->input('warehouse');
            $status = $request->input('status');
            $notes = $request->input('notes');
            $receivedBy = $request->input('received_by');

            $receipt = StockReceipt::find($id);
            if (!$receipt || $receipt->is_recycle_bin == 1) {
                throw new \Exception('Không tìm thấy phiếu nhập kho');
            }

            // Cập nhật thông tin phiếu nhập (không cho sửa items đã nhập)
            $receipt->receipt_date = $receiptDate;
            $receipt->warehouse = $warehouse;
            $receipt->status = $status;
            $receipt->notes = $notes;
            $receipt->received_by = $receivedBy;
            $receipt->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật phiếu nhập kho thành công',
                'data' => $receipt
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật phiếu nhập kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa phiếu nhập kho
     */
    public function apiDelete(Request $request)
    {
        DB::beginTransaction();
        try {
            $id = $request->input('id');

            $receipt = StockReceipt::find($id);
            if (!$receipt || $receipt->is_recycle_bin == 1) {
                throw new \Exception('Không tìm thấy phiếu nhập kho');
            }

            // Soft delete
            $receipt->is_recycle_bin = 1;
            $receipt->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa phiếu nhập kho thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa phiếu nhập kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Nhận hàng (cập nhật received_quantity)
     */
    public function apiReceiveItems(Request $request)
    {
        DB::beginTransaction();
        try {
            $purchaseOrderId = $request->input('purchase_order_id');
            $items = $request->input('items', []); // [{item_id, received_quantity}]

            foreach ($items as $item) {
                $itemId = $item['item_id'];
                $receivedQty = $item['received_quantity'];

                $orderItem = PurchaseOrderItem::where('id', $itemId)
                    ->where('purchase_order_id', $purchaseOrderId)
                    ->first();

                if ($orderItem) {
                    $newReceivedQty = $orderItem->received_quantity + $receivedQty;

                    if ($newReceivedQty > $orderItem->quantity) {
                        throw new \Exception("Số lượng nhận vượt quá số lượng đặt");
                    }

                    $orderItem->received_quantity = $newReceivedQty;
                    $orderItem->save();
                }
            }

            // Cập nhật trạng thái đơn hàng
            $this->updatePurchaseOrderStatus($purchaseOrderId);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật số lượng nhận thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật số lượng nhận: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng dựa trên received_quantity
     */
    private function updatePurchaseOrderStatus($purchaseOrderId)
    {
        $purchaseOrder = PurchaseOrder::with('items')->find($purchaseOrderId);
        if (!$purchaseOrder) {
            return;
        }

        $totalQuantity = 0;
        $totalReceived = 0;

        foreach ($purchaseOrder->items as $item) {
            $totalQuantity += $item->quantity;
            $totalReceived += $item->received_quantity;
        }

        // Cập nhật trạng thái
        if ($totalReceived == 0) {
            // Chưa nhận hàng
            if ($purchaseOrder->status !== 'draft' && $purchaseOrder->status !== 'sent') {
                $purchaseOrder->status = 'sent';
            }
        } elseif ($totalReceived < $totalQuantity) {
            // Đang nhận hàng
            $purchaseOrder->status = 'receiving';
        } else {
            // Đã nhận đủ
            $purchaseOrder->status = 'completed';
        }

        $purchaseOrder->save();
    }

    /**
     * Cập nhật trạng thái đơn hàng thủ công
     */
    public function apiUpdateOrderStatus(Request $request)
    {
        try {
            $purchaseOrderId = $request->input('purchase_order_id');
            $status = $request->input('status');

            $purchaseOrder = PurchaseOrder::find($purchaseOrderId);
            if (!$purchaseOrder) {
                throw new \Exception('Không tìm thấy đơn hàng');
            }

            $purchaseOrder->status = $status;
            $purchaseOrder->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật trạng thái đơn hàng thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật trạng thái: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê phiếu nhập kho
     */
    public function apiStatistics(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $query = StockReceipt::where('is_recycle_bin', 0);

            if ($fromDate) {
                $query->whereDate('receipt_date', '>=', $fromDate);
            }
            if ($toDate) {
                $query->whereDate('receipt_date', '<=', $toDate);
            }

            $total = $query->count();
            $completed = (clone $query)->where('status', 1)->count();
            $pending = (clone $query)->where('status', 0)->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_receipts' => $total,
                    'completed' => $completed,
                    'pending' => $pending
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
     * Danh sách đơn hàng có thể nhập kho
     */
    public function apiPurchaseOrderList(Request $request)
    {
        try {
            $purchaseOrders = PurchaseOrder::with('supplier')
                ->where('is_recycle_bin', 0)
                ->whereIn('status', ['sent', 'receiving'])
                ->orderBy('order_date', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $purchaseOrders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }
}
