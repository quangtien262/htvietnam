<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\StockReceipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseReportController extends Controller
{
    /**
     * Báo cáo tổng quan
     */
    public function apiOverview(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            // Tổng số đơn hàng
            $totalOrders = PurchaseOrder::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('order_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('order_date', '<=', $toDate);
                })
                ->count();

            // Tổng giá trị
            $totalValue = PurchaseOrder::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('order_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('order_date', '<=', $toDate);
                })
                ->sum('grand_total');

            // Tổng đã thanh toán
            $totalPaid = SupplierPayment::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('payment_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('payment_date', '<=', $toDate);
                })
                ->sum('amount');

            // Tổng công nợ
            $totalDebt = PurchaseOrder::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('order_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('order_date', '<=', $toDate);
                })
                ->select(DB::raw('SUM(grand_total - paid_amount) as total_debt'))
                ->value('total_debt');

            // Tổng số NCC
            $totalSuppliers = Supplier::where('is_recycle_bin', 0)->count();

            // Tổng phiếu nhập kho
            $totalReceipts = StockReceipt::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('receipt_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('receipt_date', '<=', $toDate);
                })
                ->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_orders' => $totalOrders,
                    'total_value' => $totalValue,
                    'total_paid' => $totalPaid,
                    'total_debt' => $totalDebt ?? 0,
                    'total_suppliers' => $totalSuppliers,
                    'total_receipts' => $totalReceipts
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy báo cáo tổng quan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Báo cáo theo NCC
     */
    public function apiBySupplier(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $suppliers = Supplier::where('is_recycle_bin', 0)
                ->withCount([
                    'purchaseOrders as total_orders' => function ($q) use ($fromDate, $toDate) {
                        $q->where('is_recycle_bin', 0)
                            ->when($fromDate, function ($query) use ($fromDate) {
                                return $query->whereDate('order_date', '>=', $fromDate);
                            })
                            ->when($toDate, function ($query) use ($toDate) {
                                return $query->whereDate('order_date', '<=', $toDate);
                            });
                    }
                ])
                ->withSum([
                    'purchaseOrders as total_value' => function ($q) use ($fromDate, $toDate) {
                        $q->where('is_recycle_bin', 0)
                            ->when($fromDate, function ($query) use ($fromDate) {
                                return $query->whereDate('order_date', '>=', $fromDate);
                            })
                            ->when($toDate, function ($query) use ($toDate) {
                                return $query->whereDate('order_date', '<=', $toDate);
                            });
                    }
                ], 'grand_total')
                ->withSum([
                    'purchaseOrders as total_paid' => function ($q) use ($fromDate, $toDate) {
                        $q->where('is_recycle_bin', 0)
                            ->when($fromDate, function ($query) use ($fromDate) {
                                return $query->whereDate('order_date', '>=', $fromDate);
                            })
                            ->when($toDate, function ($query) use ($toDate) {
                                return $query->whereDate('order_date', '<=', $toDate);
                            });
                    }
                ], 'paid_amount')
                ->get()
                ->map(function ($supplier) {
                    $supplier->total_debt = ($supplier->total_value ?? 0) - ($supplier->total_paid ?? 0);
                    return $supplier;
                });

            return response()->json([
                'status' => 'success',
                'data' => $suppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy báo cáo theo NCC: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Báo cáo theo thời gian (theo ngày/tháng)
     */
    public function apiByTime(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $groupBy = $request->input('group_by', 'day'); // day, month, year

            $dateFormat = $groupBy === 'month' ? '%Y-%m' : ($groupBy === 'year' ? '%Y' : '%Y-%m-%d');

            $ordersByTime = PurchaseOrder::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('order_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('order_date', '<=', $toDate);
                })
                ->select(
                    DB::raw("DATE_FORMAT(order_date, '{$dateFormat}') as period"),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(grand_total) as total_value'),
                    DB::raw('SUM(paid_amount) as total_paid')
                )
                ->groupBy('period')
                ->orderBy('period', 'asc')
                ->get()
                ->map(function ($item) {
                    $item->total_debt = $item->total_value - $item->total_paid;
                    return $item;
                });

            $paymentsByTime = SupplierPayment::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('payment_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('payment_date', '<=', $toDate);
                })
                ->select(
                    DB::raw("DATE_FORMAT(payment_date, '{$dateFormat}') as period"),
                    DB::raw('COUNT(*) as total_payments'),
                    DB::raw('SUM(amount) as total_amount')
                )
                ->groupBy('period')
                ->orderBy('period', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'orders_by_time' => $ordersByTime,
                    'payments_by_time' => $paymentsByTime
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy báo cáo theo thời gian: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Báo cáo trạng thái đơn hàng
     */
    public function apiByStatus(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $ordersByStatus = PurchaseOrder::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('order_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('order_date', '<=', $toDate);
                })
                ->select(
                    'status',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(grand_total) as total_value')
                )
                ->groupBy('status')
                ->get();

            $ordersByPaymentStatus = PurchaseOrder::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('order_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('order_date', '<=', $toDate);
                })
                ->select(
                    'payment_status',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(grand_total) as total_value'),
                    DB::raw('SUM(paid_amount) as total_paid')
                )
                ->groupBy('payment_status')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'by_status' => $ordersByStatus,
                    'by_payment_status' => $ordersByPaymentStatus
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy báo cáo trạng thái: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Top NCC theo giá trị mua hàng
     */
    public function apiTopSuppliers(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $limit = $request->input('limit', 10);

            $topSuppliers = Supplier::where('is_recycle_bin', 0)
                ->withCount([
                    'purchaseOrders as total_orders' => function ($q) use ($fromDate, $toDate) {
                        $q->where('is_recycle_bin', 0)
                            ->when($fromDate, function ($query) use ($fromDate) {
                                return $query->whereDate('order_date', '>=', $fromDate);
                            })
                            ->when($toDate, function ($query) use ($toDate) {
                                return $query->whereDate('order_date', '<=', $toDate);
                            });
                    }
                ])
                ->withSum([
                    'purchaseOrders as total_value' => function ($q) use ($fromDate, $toDate) {
                        $q->where('is_recycle_bin', 0)
                            ->when($fromDate, function ($query) use ($fromDate) {
                                return $query->whereDate('order_date', '>=', $fromDate);
                            })
                            ->when($toDate, function ($query) use ($toDate) {
                                return $query->whereDate('order_date', '<=', $toDate);
                            });
                    }
                ], 'grand_total')
                ->orderBy('total_value', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $topSuppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy top NCC: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Báo cáo công nợ
     */
    public function apiDebtReport(Request $request)
    {
        try {
            $suppliersWithDebt = Supplier::where('is_recycle_bin', 0)
                ->whereHas('purchaseOrders', function ($q) {
                    $q->where('is_recycle_bin', 0)
                        ->whereRaw('grand_total > paid_amount');
                })
                ->with([
                    'purchaseOrders' => function ($q) {
                        $q->where('is_recycle_bin', 0)
                            ->whereRaw('grand_total > paid_amount')
                            ->select('id', 'supplier_id', 'code', 'order_date', 'grand_total', 'paid_amount', 'payment_status');
                    }
                ])
                ->get()
                ->map(function ($supplier) {
                    $totalDebt = 0;
                    foreach ($supplier->purchaseOrders as $order) {
                        $totalDebt += $order->grand_total - $order->paid_amount;
                    }
                    $supplier->total_debt = $totalDebt;
                    return $supplier;
                })
                ->sortByDesc('total_debt')
                ->values();

            return response()->json([
                'status' => 'success',
                'data' => $suppliersWithDebt
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy báo cáo công nợ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Báo cáo theo phương thức thanh toán
     */
    public function apiByPaymentMethod(Request $request)
    {
        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $paymentsByMethod = SupplierPayment::where('is_recycle_bin', 0)
                ->when($fromDate, function ($q) use ($fromDate) {
                    return $q->whereDate('payment_date', '>=', $fromDate);
                })
                ->when($toDate, function ($q) use ($toDate) {
                    return $q->whereDate('payment_date', '<=', $toDate);
                })
                ->select(
                    'payment_method',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(amount) as total_amount')
                )
                ->groupBy('payment_method')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $paymentsByMethod
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy báo cáo phương thức thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export data cho Excel (trả về data raw)
     */
    public function apiExportData(Request $request)
    {
        try {
            $type = $request->input('type', 'orders'); // orders, payments, suppliers
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $data = [];

            switch ($type) {
                case 'orders':
                    $data = PurchaseOrder::with(['supplier', 'items'])
                        ->where('is_recycle_bin', 0)
                        ->when($fromDate, function ($q) use ($fromDate) {
                            return $q->whereDate('order_date', '>=', $fromDate);
                        })
                        ->when($toDate, function ($q) use ($toDate) {
                            return $q->whereDate('order_date', '<=', $toDate);
                        })
                        ->orderBy('order_date', 'desc')
                        ->get();
                    break;

                case 'payments':
                    $data = SupplierPayment::with(['supplier', 'purchaseOrder'])
                        ->where('is_recycle_bin', 0)
                        ->when($fromDate, function ($q) use ($fromDate) {
                            return $q->whereDate('payment_date', '>=', $fromDate);
                        })
                        ->when($toDate, function ($q) use ($toDate) {
                            return $q->whereDate('payment_date', '<=', $toDate);
                        })
                        ->orderBy('payment_date', 'desc')
                        ->get();
                    break;

                case 'suppliers':
                    $data = Supplier::withCount('purchaseOrders')
                        ->withSum('purchaseOrders', 'grand_total')
                        ->withSum('purchaseOrders', 'paid_amount')
                        ->where('is_recycle_bin', 0)
                        ->get()
                        ->map(function ($supplier) {
                            $supplier->total_debt = ($supplier->purchase_orders_sum_grand_total ?? 0) - ($supplier->purchase_orders_sum_paid_amount ?? 0);
                            return $supplier;
                        });
                    break;
            }

            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi export dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }
}
