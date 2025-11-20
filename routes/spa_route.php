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
use App\Http\Controllers\Admin\Spa\GoiDichVuController;
use App\Http\Controllers\Admin\Spa\SanPhamController;
use App\Http\Controllers\Admin\Spa\DanhMucSanPhamController;
use App\Http\Controllers\Admin\Spa\ThuongHieuController;
use App\Http\Controllers\Admin\Spa\DonViSanPhamController;
use App\Http\Controllers\Admin\Spa\XuatXuController;
use App\Http\Controllers\Admin\Spa\NhapKhoController;
use App\Http\Controllers\Admin\Spa\MembershipTierController;
use App\Http\Controllers\Admin\Spa\CaLamViecController;
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
    Route::get('/services', [AnalyticsController::class, 'services'])->name('services');
    Route::get('/customers', [AnalyticsController::class, 'customers'])->name('customers');
    Route::get('/schedule', [AnalyticsController::class, 'schedule'])->name('schedule');
    Route::get('/staff', [AnalyticsController::class, 'staff'])->name('staff');
    Route::get('/inventory', [AnalyticsController::class, 'inventory'])->name('inventory');
    Route::get('/packages', [AnalyticsController::class, 'packages'])->name('packages');
    Route::get('/feedback', [AnalyticsController::class, 'feedback'])->name('feedback');
    Route::get('/growth', [AnalyticsController::class, 'growth'])->name('growth');
    Route::get('/customer-segmentation', [AnalyticsController::class, 'customerSegmentation'])->name('customer_segmentation');
    Route::post('/export-report', [AnalyticsController::class, 'exportReport'])->name('export_report');
});

// Reports
Route::prefix('reports')->name('reports.')->group(function () {
    Route::post('/revenue', [\App\Http\Controllers\Admin\Spa\SpaReportController::class, 'getRevenueReport'])->name('revenue');
    Route::post('/transactions', [\App\Http\Controllers\Admin\Spa\SpaReportController::class, 'getTransactionsReport'])->name('transactions');
    Route::post('/staff', [\App\Http\Controllers\Admin\Spa\SpaReportController::class, 'getStaffReport'])->name('staff');
    Route::post('/inventory', [\App\Http\Controllers\Admin\Spa\SpaReportController::class, 'getInventoryReport'])->name('inventory');
    Route::post('/export', [\App\Http\Controllers\Admin\Spa\SpaReportController::class, 'exportReport'])->name('export');
});

// Services Management (CRUD)
Route::apiResource('services', \App\Http\Controllers\Admin\Spa\DichVuController::class);
Route::post('service-categories/list', [\App\Http\Controllers\Admin\Spa\DanhMucDichVuController::class, 'list'])->name('service_categories.list');
Route::apiResource('service-categories', \App\Http\Controllers\Admin\Spa\DanhMucDichVuController::class);
Route::apiResource('skills', \App\Http\Controllers\Admin\Spa\KyNangController::class);
Route::apiResource('service-packages', \App\Http\Controllers\Admin\Spa\GoiDichVuController::class);
Route::get('schedules', [\App\Http\Controllers\Admin\Spa\GoiDichVuController::class, 'getSchedules'])->name('schedules.index');
Route::get('schedules/list', [\App\Http\Controllers\Admin\Spa\GoiDichVuController::class, 'getSchedules'])->name('schedules.list');
Route::post('schedules', [\App\Http\Controllers\Admin\Spa\GoiDichVuController::class, 'createSchedule'])->name('schedules.create');
Route::apiResource('treatment-packages', \App\Http\Controllers\Admin\Spa\LieuTrinhController::class);

// Products Management (CRUD)
Route::apiResource('products', \App\Http\Controllers\Admin\Spa\SanPhamController::class);
Route::apiResource('product-categories', \App\Http\Controllers\Admin\Spa\DanhMucSanPhamController::class);
Route::apiResource('brands', \App\Http\Controllers\Admin\Spa\ThuongHieuController::class);
Route::apiResource('product-units', \App\Http\Controllers\Admin\Spa\DonViSanPhamController::class);
Route::apiResource('origins', \App\Http\Controllers\Admin\Spa\XuatXuController::class);
Route::get('inventory/{productId}/transactions', [\App\Http\Controllers\Admin\Spa\NhapKhoController::class, 'transactions'])->name('inventory.transactions');
Route::apiResource('inventory', \App\Http\Controllers\Admin\Spa\NhapKhoController::class);
Route::get('inventory-stock/list', [\App\Http\Controllers\Admin\Spa\NhapKhoController::class, 'stockList'])->name('inventory-stock.list');
Route::post('inventory/bulk-import', [\App\Http\Controllers\Admin\Spa\NhapKhoController::class, 'bulkImport'])->name('inventory.bulk-import');
Route::post('inventory/import-csv', [\App\Http\Controllers\Admin\Spa\NhapKhoController::class, 'importCsv'])->name('inventory.import-csv');

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
    Route::get('/suppliers', [TraHangNhapController::class, 'getSuppliers'])->name('suppliers');
    Route::get('/suppliers/{supplierId}/receipts', [TraHangNhapController::class, 'getReceiptsBySupplier'])->name('supplier-receipts');
    Route::get('/receipts/{receiptId}/products', [TraHangNhapController::class, 'getProductsByReceipt'])->name('receipt-products');
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

// Ca làm việc (Shift Management)
Route::prefix('shifts')->name('shifts.')->group(function () {
    Route::get('/current', [CaLamViecController::class, 'getCurrentShift'])->name('current');
    Route::post('/open', [CaLamViecController::class, 'openShift'])->name('open');
    Route::post('/{id}/close', [CaLamViecController::class, 'closeShift'])->name('close');
    Route::get('/', [CaLamViecController::class, 'index'])->name('index');
    Route::get('/{id}', [CaLamViecController::class, 'show'])->name('show');
    Route::get('/{id}/print', [CaLamViecController::class, 'printHandover'])->name('print');
});



// Branches
Route::get('branches', [\App\Http\Controllers\Admin\Spa\ChiNhanhController::class, 'index'])->name('api.spa.branches.index');
Route::get('branches/{id}', [\App\Http\Controllers\Admin\Spa\ChiNhanhController::class, 'show'])->name('api.spa.branches.show');
Route::post('branches', [\App\Http\Controllers\Admin\Spa\ChiNhanhController::class, 'store'])->name('api.spa.branches.store');
Route::put('branches/{id}', [\App\Http\Controllers\Admin\Spa\ChiNhanhController::class, 'update'])->name('api.spa.branches.update');
Route::delete('branches/{id}', [\App\Http\Controllers\Admin\Spa\ChiNhanhController::class, 'destroy'])->name('api.spa.branches.destroy');

// Analytics / Dashboard
Route::get('analytics/dashboard', [\App\Http\Controllers\Admin\Spa\AnalyticsController::class, 'dashboard'])->name('api.spa.analytics.dashboard');
Route::get('analytics/revenue', [\App\Http\Controllers\Admin\Spa\AnalyticsController::class, 'revenue'])->name('api.spa.analytics.revenue');
Route::get('analytics/services', [\App\Http\Controllers\Admin\Spa\AnalyticsController::class, 'services'])->name('api.spa.analytics.services');

// Phòng (Rooms)
Route::get('rooms', [\App\Http\Controllers\Admin\Spa\PhongController::class, 'index'])->name('api.spa.rooms.index');
Route::get('rooms/{id}', [\App\Http\Controllers\Admin\Spa\PhongController::class, 'show'])->name('api.spa.rooms.show');
Route::post('rooms', [\App\Http\Controllers\Admin\Spa\PhongController::class, 'store'])->name('api.spa.rooms.store');
Route::put('rooms/{id}', [\App\Http\Controllers\Admin\Spa\PhongController::class, 'update'])->name('api.spa.rooms.update');
Route::delete('rooms/{id}', [\App\Http\Controllers\Admin\Spa\PhongController::class, 'destroy'])->name('api.spa.rooms.destroy');
Route::get('rooms/available', [\App\Http\Controllers\Admin\Spa\PhongController::class, 'available'])->name('api.spa.rooms.available');

// Ca làm việc (Shifts)
Route::get('ca-lam-viec/current', [\App\Http\Controllers\Admin\Spa\CaLamViecController::class, 'getCurrentShift'])->name('api.spa.shifts.current');
Route::post('ca-lam-viec/open', [\App\Http\Controllers\Admin\Spa\CaLamViecController::class, 'openShift'])->name('api.spa.shifts.open');
Route::post('ca-lam-viec/{id}/close', [\App\Http\Controllers\Admin\Spa\CaLamViecController::class, 'closeShift'])->name('api.spa.shifts.close');
Route::get('ca-lam-viec', [\App\Http\Controllers\Admin\Spa\CaLamViecController::class, 'index'])->name('api.spa.shifts.index');
Route::get('ca-lam-viec/{id}', [\App\Http\Controllers\Admin\Spa\CaLamViecController::class, 'show'])->name('api.spa.shifts.show');
Route::get('ca-lam-viec/{id}/print', [\App\Http\Controllers\Admin\Spa\CaLamViecController::class, 'printHandover'])->name('api.spa.shifts.print');

// Services
Route::get('services', [\App\Http\Controllers\Admin\Spa\DichVuController::class, 'index'])->name('api.spa.services.index');
Route::post('service-categories/list', [\App\Http\Controllers\Admin\Spa\DanhMucDichVuController::class, 'list'])->name('api.spa.service-categories.list');
Route::get('service-categories', [\App\Http\Controllers\Admin\Spa\DanhMucDichVuController::class, 'index'])->name('api.spa.service-categories.index');
Route::get('service-packages', [\App\Http\Controllers\Admin\Spa\GoiDichVuController::class, 'index'])->name('api.spa.service-packages.index');

// Products
Route::get('products', [\App\Http\Controllers\Admin\Spa\SanPhamController::class, 'index'])->name('api.spa.products.index');
Route::get('products/{id}', [\App\Http\Controllers\Admin\Spa\SanPhamController::class, 'show'])->name('api.spa.products.show');
Route::post('products', [\App\Http\Controllers\Admin\Spa\SanPhamController::class, 'store'])->name('api.spa.products.store');
Route::put('products/{id}', [\App\Http\Controllers\Admin\Spa\SanPhamController::class, 'update'])->name('api.spa.products.update');
Route::delete('products/{id}', [\App\Http\Controllers\Admin\Spa\SanPhamController::class, 'destroy'])->name('api.spa.products.destroy');

// Product Categories
Route::get('product-categories', [\App\Http\Controllers\Admin\Spa\DanhMucSanPhamController::class, 'index'])->name('api.spa.product-categories.index');
Route::post('product-categories', [\App\Http\Controllers\Admin\Spa\DanhMucSanPhamController::class, 'store'])->name('api.spa.product-categories.store');
Route::get('product-categories/{id}', [\App\Http\Controllers\Admin\Spa\DanhMucSanPhamController::class, 'show'])->name('api.spa.product-categories.show');
Route::put('product-categories/{id}', [\App\Http\Controllers\Admin\Spa\DanhMucSanPhamController::class, 'update'])->name('api.spa.product-categories.update');
Route::delete('product-categories/{id}', [\App\Http\Controllers\Admin\Spa\DanhMucSanPhamController::class, 'destroy'])->name('api.spa.product-categories.destroy');

// Brands (Thương hiệu)
Route::get('brands', [\App\Http\Controllers\Admin\Spa\ThuongHieuController::class, 'index'])->name('api.spa.brands.index');
Route::post('brands', [\App\Http\Controllers\Admin\Spa\ThuongHieuController::class, 'store'])->name('api.spa.brands.store');
Route::get('brands/{id}', [\App\Http\Controllers\Admin\Spa\ThuongHieuController::class, 'show'])->name('api.spa.brands.show');
Route::put('brands/{id}', [\App\Http\Controllers\Admin\Spa\ThuongHieuController::class, 'update'])->name('api.spa.brands.update');
Route::delete('brands/{id}', [\App\Http\Controllers\Admin\Spa\ThuongHieuController::class, 'destroy'])->name('api.spa.brands.destroy');

// Origins (Xuất xứ)
Route::get('origins', [\App\Http\Controllers\Admin\Spa\XuatXuController::class, 'index'])->name('api.spa.origins.index');
Route::post('origins', [\App\Http\Controllers\Admin\Spa\XuatXuController::class, 'store'])->name('api.spa.origins.store');
Route::get('origins/{id}', [\App\Http\Controllers\Admin\Spa\XuatXuController::class, 'show'])->name('api.spa.origins.show');
Route::put('origins/{id}', [\App\Http\Controllers\Admin\Spa\XuatXuController::class, 'update'])->name('api.spa.origins.update');
Route::delete('origins/{id}', [\App\Http\Controllers\Admin\Spa\XuatXuController::class, 'destroy'])->name('api.spa.origins.destroy');

// POS
Route::post('pos/invoices', [\App\Http\Controllers\Admin\Spa\POSController::class, 'createInvoice'])->name('api.spa.pos.create-invoice');
Route::get('pos/invoices', [\App\Http\Controllers\Admin\Spa\POSController::class, 'index'])->name('api.spa.pos.invoices');

// Invoices (Hóa đơn)
Route::get('invoices', [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'index'])->name('api.spa.invoices.index');
Route::get('invoices/{id}', [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'show'])->name('api.spa.invoices.show');
Route::put('invoices/{id}', [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'update'])->name('api.spa.invoices.update');
Route::delete('invoices/{id}', [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'destroy'])->name('api.spa.invoices.destroy');
Route::get('invoices/{id}/print', [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'print'])->name('api.spa.invoices.print');
Route::post('invoices/export', [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'export'])->name('api.spa.invoices.export');
Route::post('invoices/{id}/pay-debt', [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'payDebt'])->name('api.spa.invoices.pay-debt');

// Gift Cards (Thẻ Giá Trị)
Route::get('gift-cards', [\App\Http\Controllers\Admin\Spa\TheGiaTriController::class, 'index'])->name('api.spa.gift-cards.index');
Route::get('gift-cards/{id}', [\App\Http\Controllers\Admin\Spa\TheGiaTriController::class, 'show'])->name('api.spa.gift-cards.show');
Route::post('gift-cards', [\App\Http\Controllers\Admin\Spa\TheGiaTriController::class, 'store'])->name('api.spa.gift-cards.store');
Route::put('gift-cards/{id}', [\App\Http\Controllers\Admin\Spa\TheGiaTriController::class, 'update'])->name('api.spa.gift-cards.update');
Route::delete('gift-cards/{id}', [\App\Http\Controllers\Admin\Spa\TheGiaTriController::class, 'destroy'])->name('api.spa.gift-cards.destroy');
Route::post('gift-cards/validate-code', [\App\Http\Controllers\Admin\Spa\TheGiaTriController::class, 'validateCode'])->name('api.spa.gift-cards.validate-code');

// Wallet (Ví Khách Hàng)
Route::get('wallet/{khach_hang_id}', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'getWallet'])->name('api.spa.wallet.get');
Route::get('wallet/{khach_hang_id}/history', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'getHistory'])->name('api.spa.wallet.history');
Route::post('wallet/deposit', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'napTien'])->name('api.spa.wallet.deposit');
Route::post('wallet/withdraw', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'truTien'])->name('api.spa.wallet.withdraw');
Route::post('wallet/refund', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'hoanTien'])->name('api.spa.wallet.refund');
Route::post('wallet/apply-code', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'applyCode'])->name('api.spa.wallet.apply-code');
Route::post('wallet/{khach_hang_id}/set-limits', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'setLimits'])->name('api.spa.wallet.set-limits');

// Wallet Reports
Route::get('wallet/reports/stats', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'getReportStats'])->name('api.spa.wallet.reports.stats');
Route::get('wallet/reports/top-customers', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'getTopCustomers'])->name('api.spa.wallet.reports.top-customers');
Route::get('wallet/reports/gift-card-revenue', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'getGiftCardRevenue'])->name('api.spa.wallet.reports.gift-card-revenue');
Route::get('wallet/reports/transactions', [\App\Http\Controllers\Admin\Spa\ViKhachHangController::class, 'getTransactions'])->name('api.spa.wallet.reports.transactions');

// Vouchers
Route::post('vouchers/list', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'index'])->name('api.spa.vouchers.list');
Route::post('vouchers/create-or-update', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'createOrUpdate'])->name('api.spa.vouchers.createOrUpdate');
Route::post('vouchers/delete', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'delete'])->name('api.spa.vouchers.delete');
Route::post('vouchers/verify', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'verify'])->name('api.spa.vouchers.verify');
Route::post('vouchers/apply', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'apply'])->name('api.spa.vouchers.apply');
Route::get('vouchers', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'index'])->name('api.spa.vouchers.index');
Route::post('vouchers', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'store'])->name('api.spa.vouchers.store');
Route::get('vouchers/{id}', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'show'])->name('api.spa.vouchers.show');

// Customer Packages (Gói dịch vụ của khách hàng)
Route::post('customer-packages/list', [\App\Http\Controllers\Admin\Spa\CustomerPackageController::class, 'getCustomerPackages'])->name('api.spa.customer-packages.list');
Route::post('customer-packages/use', [\App\Http\Controllers\Admin\Spa\CustomerPackageController::class, 'usePackage'])->name('api.spa.customer-packages.use');
Route::post('customer-packages/purchase', [\App\Http\Controllers\Admin\Spa\CustomerPackageController::class, 'purchasePackage'])->name('api.spa.customer-packages.purchase');

// Settings (Cấu hình)
Route::get('settings/get', [\App\Http\Controllers\Admin\Spa\SettingController::class, 'get'])->name('api.spa.settings.get');
Route::post('settings/update', [\App\Http\Controllers\Admin\Spa\SettingController::class, 'update'])->name('api.spa.settings.update');
Route::post('upload-image', [\App\Http\Controllers\Admin\Spa\SettingController::class, 'uploadImage'])->name('api.spa.upload-image');
Route::post('customer-packages/history', [\App\Http\Controllers\Admin\Spa\CustomerPackageController::class, 'getPackageHistory'])->name('api.spa.customer-packages.history');
Route::put('vouchers/{id}', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'update'])->name('api.spa.vouchers.update');
Route::delete('vouchers/{id}', [\App\Http\Controllers\Admin\Spa\VoucherController::class, 'destroy'])->name('api.spa.vouchers.destroy');

// Marketing Campaigns
Route::post('campaigns/list', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'index'])->name('api.spa.campaigns.list');
Route::post('campaigns/create-or-update', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'createOrUpdate'])->name('api.spa.campaigns.createOrUpdate');
Route::post('campaigns/delete', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'delete'])->name('api.spa.campaigns.delete');
Route::post('campaigns/send', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'send'])->name('api.spa.campaigns.send');
Route::post('campaigns/count-target', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'countTarget'])->name('api.spa.campaigns.countTarget');
Route::get('campaigns', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'index'])->name('api.spa.campaigns.index');
Route::post('campaigns', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'store'])->name('api.spa.campaigns.store');
Route::get('campaigns/{id}', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'show'])->name('api.spa.campaigns.show');
Route::put('campaigns/{id}', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'update'])->name('api.spa.campaigns.update');
Route::delete('campaigns/{id}', [\App\Http\Controllers\Admin\Spa\EmailCampaignController::class, 'destroy'])->name('api.spa.campaigns.destroy');

// Bookings
Route::post('bookings/list', [\App\Http\Controllers\Admin\Spa\BookingController::class, 'index'])->name('api.spa.bookings.list');
Route::get('bookings', [\App\Http\Controllers\Admin\Spa\BookingController::class, 'index'])->name('api.spa.bookings.index');
Route::post('bookings', [\App\Http\Controllers\Admin\Spa\BookingController::class, 'store'])->name('api.spa.bookings.store');
Route::get('bookings/{id}', [\App\Http\Controllers\Admin\Spa\BookingController::class, 'show'])->name('api.spa.bookings.show');
Route::put('bookings/{id}', [\App\Http\Controllers\Admin\Spa\BookingController::class, 'update'])->name('api.spa.bookings.update');
Route::delete('bookings/{id}', [\App\Http\Controllers\Admin\Spa\BookingController::class, 'destroy'])->name('api.spa.bookings.destroy');
