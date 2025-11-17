<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\Spa\BookingController;
use App\Http\Controllers\Admin\Spa\POSController;
use App\Http\Controllers\Admin\Spa\AnalyticsController;
use App\Http\Controllers\Admin\Spa\KTVController;
use App\Http\Controllers\Admin\Spa\MembershipController;
use App\Http\Controllers\Admin\Spa\CauHinhController;
use App\Http\Controllers\Admin\Spa\DichVuController;
use App\Http\Controllers\Admin\Spa\DanhMucDichVuController;
use App\Http\Controllers\Admin\Spa\LieuTrinhController;
use App\Http\Controllers\Admin\Spa\SanPhamController;
use App\Http\Controllers\Admin\Spa\DanhMucSanPhamController;
use App\Http\Controllers\Admin\Spa\ThuongHieuController;
use App\Http\Controllers\Admin\Spa\NhapKhoController;
use App\Http\Controllers\Admin\Spa\MembershipTierController;
use App\Http\Controllers\Admin\Spa\ChuongTrinhKhuyenMaiController;
use App\Http\Controllers\Admin\Spa\VoucherController;
use App\Http\Controllers\Admin\Spa\EmailCampaignController;
use App\Http\Controllers\Admin\Spa\KhachHangController;
use App\Http\Controllers\Admin\Spa\SMSCampaignController;
use App\Http\Controllers\Admin\Spa\ChiNhanhController;
use App\Http\Controllers\Admin\Spa\PhongController;
use App\Http\Controllers\Admin\Spa\DanhGiaController;
use App\Http\Controllers\Admin\Spa\TonKhoChiNhanhController;
use App\Http\Controllers\Admin\Spa\ChuyenKhoController;
use App\Http\Controllers\Admin\Spa\KiemKhoController;
use App\Http\Controllers\Admin\Spa\TraHangNhapController;
use App\Http\Controllers\Admin\Spa\XuatHuyController;
use App\Http\Controllers\Admin\Spa\NhaCungCapController;

/*
|--------------------------------------------------------------------------
| SPA Management Routes
|--------------------------------------------------------------------------
*/

// Customer Management - sử dụng KhachHangController (bảng users)
Route::prefix('customers')->name('customers.')->group(function () {
    Route::get('/', [KhachHangController::class, 'index'])->name('index');
    Route::post('/', [KhachHangController::class, 'store'])->name('store');
    Route::get('/{id}', [KhachHangController::class, 'show'])->name('show');
    Route::put('/{id}', [KhachHangController::class, 'update'])->name('update');
    Route::delete('/{id}', [KhachHangController::class, 'destroy'])->name('destroy');
    Route::get('/{id}/statistics', [KhachHangController::class, 'statistics'])->name('statistics');
    Route::post('/segment', [KhachHangController::class, 'segment'])->name('segment');
});

// Booking Management
Route::prefix('bookings')->name('bookings.')->group(function () {
    Route::get('/', [BookingController::class, 'index'])->name('index');
    Route::post('/', [BookingController::class, 'store'])->name('store');
    Route::put('/{id}', [BookingController::class, 'update'])->name('update');
    Route::post('/{id}/confirm', [BookingController::class, 'confirm'])->name('confirm');
    Route::post('/{id}/start', [BookingController::class, 'start'])->name('start');
    Route::post('/{id}/complete', [BookingController::class, 'complete'])->name('complete');
    Route::post('/{id}/cancel', [BookingController::class, 'cancel'])->name('cancel');
    Route::get('/calendar', [BookingController::class, 'calendar'])->name('calendar');
    Route::get('/available-ktvs', [BookingController::class, 'availableKTVs'])->name('available_ktvs');
    Route::get('/available-rooms', [BookingController::class, 'availableRooms'])->name('available_rooms');
});

// POS - Point of Sale
Route::prefix('pos')->name('pos.')->group(function () {
    Route::get('/invoices', [POSController::class, 'index'])->name('invoices_list');
    Route::post('/invoices', [POSController::class, 'createInvoice'])->name('create_invoice');
    Route::get('/invoices/{id}', [POSController::class, 'getInvoice'])->name('get_invoice');
    Route::post('/invoices/{id}/payment', [POSController::class, 'processPayment'])->name('process_payment');
    Route::post('/invoices/{id}/cancel', [POSController::class, 'cancelInvoice'])->name('cancel_invoice');
    Route::get('/today-sales', [POSController::class, 'todaySales'])->name('today_sales');
});

// Analytics & Reports
Route::prefix('analytics')->name('analytics.')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard'])->name('dashboard');
    Route::get('/revenue', [AnalyticsController::class, 'revenue'])->name('revenue');
    Route::get('/customer-segmentation', [AnalyticsController::class, 'customerSegmentation'])->name('customer_segmentation');
    Route::post('/export-report', [AnalyticsController::class, 'exportReport'])->name('export_report');
});

// Services Management (CRUD)
Route::apiResource('services', \App\Http\Controllers\Admin\Spa\DichVuController::class);
Route::post('service-categories/list', [\App\Http\Controllers\Admin\Spa\DanhMucDichVuController::class, 'list'])->name('service_categories.list');
Route::apiResource('service-categories', \App\Http\Controllers\Admin\Spa\DanhMucDichVuController::class);
Route::apiResource('treatment-packages', \App\Http\Controllers\Admin\Spa\LieuTrinhController::class);

// Products Management (CRUD)
Route::apiResource('products', \App\Http\Controllers\Admin\Spa\SanPhamController::class);
Route::apiResource('product-categories', \App\Http\Controllers\Admin\Spa\DanhMucSanPhamController::class);
Route::apiResource('brands', \App\Http\Controllers\Admin\Spa\ThuongHieuController::class);
Route::apiResource('inventory', \App\Http\Controllers\Admin\Spa\NhapKhoController::class);

// Staff Management
Route::apiResource('staff', \App\Http\Controllers\Admin\Spa\KTVController::class);
Route::prefix('staff')->name('staff.')->group(function () {
    Route::get('/{id}/schedule', [\App\Http\Controllers\Admin\Spa\KTVController::class, 'schedule'])->name('schedule');
    Route::post('/{id}/schedule', [\App\Http\Controllers\Admin\Spa\KTVController::class, 'updateSchedule'])->name('update_schedule');
    Route::get('/{id}/commissions', [\App\Http\Controllers\Admin\Spa\KTVController::class, 'commissions'])->name('commissions');
    Route::get('/{id}/leave-requests', [\App\Http\Controllers\Admin\Spa\KTVController::class, 'leaveRequests'])->name('leave_requests');
});

// Membership Management
Route::apiResource('membership-tiers', \App\Http\Controllers\Admin\Spa\MembershipTierController::class);
Route::prefix('memberships')->name('memberships.')->group(function () {
    Route::post('/{id}/renew', [\App\Http\Controllers\Admin\Spa\MembershipController::class, 'renew'])->name('renew');
    Route::post('/{id}/upgrade', [\App\Http\Controllers\Admin\Spa\MembershipController::class, 'upgrade'])->name('upgrade');
});

// Marketing Campaigns
Route::apiResource('promotions', \App\Http\Controllers\Admin\Spa\ChuongTrinhKhuyenMaiController::class);
Route::apiResource('vouchers', \App\Http\Controllers\Admin\Spa\VoucherController::class);
Route::apiResource('email-campaigns', \App\Http\Controllers\Admin\Spa\EmailCampaignController::class);
Route::apiResource('sms-campaigns', \App\Http\Controllers\Admin\Spa\SMSCampaignController::class);

// System Settings
Route::apiResource('branches', \App\Http\Controllers\Admin\Spa\ChiNhanhController::class);
Route::apiResource('rooms', \App\Http\Controllers\Admin\Spa\PhongController::class);
Route::prefix('settings')->name('settings.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\Spa\CauHinhController::class, 'index'])->name('index');
    Route::post('/', [\App\Http\Controllers\Admin\Spa\CauHinhController::class, 'update'])->name('update');
});

// Reviews & Ratings
Route::apiResource('reviews', \App\Http\Controllers\Admin\Spa\DanhGiaController::class);

// ============================================
// MULTI-WAREHOUSE MANAGEMENT SYSTEM
// ============================================

// Branch Inventory (Tồn kho theo chi nhánh)
Route::prefix('ton-kho-chi-nhanh')->name('ton-kho-chi-nhanh.')->group(function () {
    Route::get('/', [TonKhoChiNhanhController::class, 'index'])->name('index');
    Route::get('/branch/{chiNhanhId}', [TonKhoChiNhanhController::class, 'getByBranch'])->name('by-branch');
    Route::get('/product/{sanPhamId}', [TonKhoChiNhanhController::class, 'getByProduct'])->name('by-product');
    Route::get('/branch/{chiNhanhId}/low-stock', [TonKhoChiNhanhController::class, 'getLowStock'])->name('low-stock');
    Route::get('/branch/{chiNhanhId}/out-of-stock', [TonKhoChiNhanhController::class, 'getOutOfStock'])->name('out-of-stock');
    Route::post('/sync', [TonKhoChiNhanhController::class, 'sync'])->name('sync');
    Route::post('/update-reserved', [TonKhoChiNhanhController::class, 'updateReserved'])->name('update-reserved');
    Route::get('/statistics', [TonKhoChiNhanhController::class, 'statistics'])->name('statistics');
    Route::get('/branches', [TonKhoChiNhanhController::class, 'getBranches'])->name('branches');
});

// Stock Transfer (Chuyển kho)
Route::prefix('chuyen-kho')->name('chuyen-kho.')->group(function () {
    Route::get('/', [ChuyenKhoController::class, 'index'])->name('index');
    Route::post('/', [ChuyenKhoController::class, 'store'])->name('store');
    Route::get('/{id}', [ChuyenKhoController::class, 'show'])->name('show');
    Route::put('/{id}', [ChuyenKhoController::class, 'update'])->name('update');
    Route::post('/{id}/approve', [ChuyenKhoController::class, 'approve'])->name('approve');
    Route::post('/{id}/receive', [ChuyenKhoController::class, 'receive'])->name('receive');
    Route::post('/{id}/cancel', [ChuyenKhoController::class, 'cancel'])->name('cancel');
    Route::get('/branch/{chiNhanhId}/history', [ChuyenKhoController::class, 'history'])->name('history');
    Route::get('/statistics', [ChuyenKhoController::class, 'statistics'])->name('statistics');
});

// Inventory Count (Kiểm kho)
Route::prefix('kiem-kho')->name('kiem-kho.')->group(function () {
    Route::get('/', [KiemKhoController::class, 'index'])->name('index');
    Route::post('/', [KiemKhoController::class, 'store'])->name('store');
    Route::get('/{id}', [KiemKhoController::class, 'show'])->name('show');
    Route::put('/{id}', [KiemKhoController::class, 'update'])->name('update');
    Route::post('/{id}/submit', [KiemKhoController::class, 'submit'])->name('submit');
    Route::post('/{id}/approve', [KiemKhoController::class, 'approve'])->name('approve');
    Route::post('/{id}/cancel', [KiemKhoController::class, 'cancel'])->name('cancel');
    Route::get('/branch/{chiNhanhId}/products', [KiemKhoController::class, 'getProducts'])->name('products');
    Route::get('/statistics', [KiemKhoController::class, 'statistics'])->name('statistics');
});

// Purchase Return (Trả hàng nhập)
Route::prefix('tra-hang-nhap')->name('tra-hang-nhap.')->group(function () {
    Route::get('/', [TraHangNhapController::class, 'index'])->name('index');
    Route::post('/', [TraHangNhapController::class, 'store'])->name('store');
    Route::get('/{id}', [TraHangNhapController::class, 'show'])->name('show');
    Route::post('/{id}/approve', [TraHangNhapController::class, 'approve'])->name('approve');
    Route::post('/{id}/cancel', [TraHangNhapController::class, 'cancel'])->name('cancel');
    Route::get('/statistics', [TraHangNhapController::class, 'statistics'])->name('statistics');
});

// Disposal (Xuất hủy)
Route::prefix('xuat-huy')->name('xuat-huy.')->group(function () {
    Route::get('/', [XuatHuyController::class, 'index'])->name('index');
    Route::get('/statistics', [XuatHuyController::class, 'statistics'])->name('statistics');
    Route::post('/', [XuatHuyController::class, 'store'])->name('store');
    Route::get('/{id}', [XuatHuyController::class, 'show'])->name('show');
    Route::post('/{id}/approve', [XuatHuyController::class, 'approve'])->name('approve');
    Route::post('/{id}/cancel', [XuatHuyController::class, 'cancel'])->name('cancel');
});

// Supplier Management (Quản lý nhà cung cấp)
Route::prefix('nha-cung-cap')->name('nha-cung-cap.')->group(function () {
    Route::get('/', [NhaCungCapController::class, 'index'])->name('index');
    Route::post('/', [NhaCungCapController::class, 'store'])->name('store');
    Route::get('/{id}', [NhaCungCapController::class, 'show'])->name('show');
    Route::put('/{id}', [NhaCungCapController::class, 'update'])->name('update');
    Route::delete('/{id}', [NhaCungCapController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/toggle-status', [NhaCungCapController::class, 'toggleStatus'])->name('toggle-status');
    Route::get('/statistics', [NhaCungCapController::class, 'statistics'])->name('statistics');
});
