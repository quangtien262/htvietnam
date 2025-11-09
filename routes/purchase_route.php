<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\PurchaseOrderController;
use App\Http\Controllers\Admin\StockReceiptController;
use App\Http\Controllers\Admin\SupplierPaymentController;
use App\Http\Controllers\Admin\PurchaseReportController;
use App\Http\Controllers\Admin\HangHoaController;
use App\Http\Controllers\Admin\LoaiHangHoaController;

// Supplier routes
Route::post('/api/supplier/list', [SupplierController::class, 'apiList']);
Route::post('/api/supplier/detail', [SupplierController::class, 'apiDetail']);
Route::post('/api/supplier/add', [SupplierController::class, 'apiAdd']);
Route::post('/api/supplier/update', [SupplierController::class, 'apiUpdate']);
Route::post('/api/supplier/delete', [SupplierController::class, 'apiDelete']);
Route::post('/api/supplier/statistics', [SupplierController::class, 'apiStatistics']);
Route::post('/api/supplier/purchase-history', [SupplierController::class, 'apiPurchaseHistory']);
Route::post('/api/supplier/payment-history', [SupplierController::class, 'apiPaymentHistory']);

// Purchase Order routes
Route::post('/api/purchase-order/list', [PurchaseOrderController::class, 'apiList']);
Route::post('/api/purchase-order/detail', [PurchaseOrderController::class, 'apiDetail']);
Route::post('/api/purchase-order/add', [PurchaseOrderController::class, 'apiAdd']);
Route::post('/api/purchase-order/update', [PurchaseOrderController::class, 'apiUpdate']);
Route::post('/api/purchase-order/delete', [PurchaseOrderController::class, 'apiDelete']);
Route::post('/api/purchase-order/update-status', [PurchaseOrderController::class, 'apiUpdateStatus']);
Route::post('/api/purchase-order/statistics', [PurchaseOrderController::class, 'apiStatistics']);
Route::post('/api/purchase-order/supplier-list', [PurchaseOrderController::class, 'apiSupplierList']);
Route::post('/api/purchase-order/status-list', [PurchaseOrderController::class, 'apiStatusList']);

// Stock Receipt routes
Route::post('/api/stock-receipt/list', [StockReceiptController::class, 'apiList']);
Route::post('/api/stock-receipt/detail', [StockReceiptController::class, 'apiDetail']);
Route::post('/api/stock-receipt/add', [StockReceiptController::class, 'apiAdd']);
Route::post('/api/stock-receipt/update', [StockReceiptController::class, 'apiUpdate']);
Route::post('/api/stock-receipt/delete', [StockReceiptController::class, 'apiDelete']);
Route::post('/api/stock-receipt/receive-items', [StockReceiptController::class, 'apiReceiveItems']);
Route::post('/api/stock-receipt/update-order-status', [StockReceiptController::class, 'apiUpdateOrderStatus']);
Route::post('/api/stock-receipt/statistics', [StockReceiptController::class, 'apiStatistics']);
Route::post('/api/stock-receipt/purchase-order-list', [StockReceiptController::class, 'apiPurchaseOrderList']);

// Supplier Payment routes
Route::post('/api/payment/list', [SupplierPaymentController::class, 'apiList']);
Route::post('/api/payment/detail', [SupplierPaymentController::class, 'apiDetail']);
Route::post('/api/payment/add', [SupplierPaymentController::class, 'apiAdd']);
Route::post('/api/payment/update', [SupplierPaymentController::class, 'apiUpdate']);
Route::post('/api/payment/delete', [SupplierPaymentController::class, 'apiDelete']);
Route::post('/api/payment/by-supplier', [SupplierPaymentController::class, 'apiPaymentsBySupplier']);
Route::post('/api/payment/by-order', [SupplierPaymentController::class, 'apiPaymentsByOrder']);
Route::post('/api/payment/statistics', [SupplierPaymentController::class, 'apiStatistics']);
Route::post('/api/payment/supplier-list', [SupplierPaymentController::class, 'apiSupplierList']);
Route::post('/api/payment/unpaid-orders', [SupplierPaymentController::class, 'apiUnpaidOrdersBySupplier']);

// Purchase Report routes
Route::post('/api/report/overview', [PurchaseReportController::class, 'apiOverview']);
Route::post('/api/report/by-supplier', [PurchaseReportController::class, 'apiBySupplier']);
Route::post('/api/report/by-time', [PurchaseReportController::class, 'apiByTime']);
Route::post('/api/report/by-status', [PurchaseReportController::class, 'apiByStatus']);
Route::post('/api/report/top-suppliers', [PurchaseReportController::class, 'apiTopSuppliers']);
Route::post('/api/report/debt', [PurchaseReportController::class, 'apiDebtReport']);
Route::post('/api/report/by-payment-method', [PurchaseReportController::class, 'apiByPaymentMethod']);
Route::post('/api/report/export', [PurchaseReportController::class, 'apiExportData']);

// Hàng hóa routes
Route::post('/api/hang-hoa/list', [HangHoaController::class, 'apiList']);
Route::post('/api/hang-hoa/detail', [HangHoaController::class, 'apiDetail']);
Route::post('/api/hang-hoa/add', [HangHoaController::class, 'apiAdd']);
Route::post('/api/hang-hoa/update', [HangHoaController::class, 'apiUpdate']);
Route::post('/api/hang-hoa/delete', [HangHoaController::class, 'apiDelete']);
Route::post('/api/hang-hoa/active', [HangHoaController::class, 'apiGetActive']);

// Loại hàng hóa routes
Route::post('/api/loai-hang-hoa/list', [LoaiHangHoaController::class, 'apiList']);
Route::post('/api/loai-hang-hoa/add', [LoaiHangHoaController::class, 'apiAdd']);
Route::post('/api/loai-hang-hoa/update', [LoaiHangHoaController::class, 'apiUpdate']);
Route::post('/api/loai-hang-hoa/delete', [LoaiHangHoaController::class, 'apiDelete']);
