<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\TaiKhoanNganHangController;
use App\Http\Controllers\Admin\GiaoDichNganHangController;
use App\Http\Controllers\Admin\ERPDashboardController;
use App\Http\Controllers\Admin\ChamCongController;
use App\Http\Controllers\Admin\BangLuongController;
use App\Http\Controllers\Admin\NghiPhepController;
use App\Http\Controllers\Admin\CaLamViecController;
use App\Http\Controllers\Admin\BaoCaoNhanSuController;
use App\Http\Controllers\Document\BinhLuanController;

// ============================
// MODULE NGÂN HÀNG
// ============================

// Tài khoản ngân hàng
Route::get('/bank/account', [TaiKhoanNganHangController::class, 'index'])->name('bank.account.index');
Route::post('/api/bank/account/list', [TaiKhoanNganHangController::class, 'apiList'])->name('api.bank.account.list');
Route::post('/api/bank/account/add', [TaiKhoanNganHangController::class, 'apiAdd'])->name('api.bank.account.add');
Route::post('/api/bank/account/update', [TaiKhoanNganHangController::class, 'apiUpdate'])->name('api.bank.account.update');
Route::post('/api/bank/account/delete', [TaiKhoanNganHangController::class, 'apiDelete'])->name('api.bank.account.delete');
Route::post('/api/bank/account/update-sort-order', [TaiKhoanNganHangController::class, 'apiUpdateSortOrder'])->name('api.bank.account.update-sort-order');

// Giao dịch ngân hàng
Route::get('/bank/transaction', [GiaoDichNganHangController::class, 'index'])->name('bank.transaction.index');
Route::post('/api/bank/transaction/list', [GiaoDichNganHangController::class, 'apiList'])->name('api.bank.transaction.list');
Route::post('/api/bank/transaction/add', [GiaoDichNganHangController::class, 'apiAdd'])->name('api.bank.transaction.add');
Route::post('/api/bank/transaction/update', [GiaoDichNganHangController::class, 'apiUpdate'])->name('api.bank.transaction.update');
Route::post('/api/bank/transaction/delete', [GiaoDichNganHangController::class, 'apiDelete'])->name('api.bank.transaction.delete');
Route::post('/api/bank/transaction/tai-khoan-list', [GiaoDichNganHangController::class, 'apiTaiKhoanList'])->name('api.bank.transaction.tai-khoan-list');

// ============================
// MODULE ERP DASHBOARD
// ============================

Route::get('/erp/dashboard', [ERPDashboardController::class, 'index'])->name('erp.dashboard.index');
Route::post('/api/erp/dashboard/overview', [ERPDashboardController::class, 'apiOverview'])->name('api.erp.dashboard.overview');
Route::post('/api/erp/dashboard/cash-flow', [ERPDashboardController::class, 'apiCashFlow'])->name('api.erp.dashboard.cash-flow');
Route::post('/api/erp/dashboard/cong-no', [ERPDashboardController::class, 'apiCongNo'])->name('api.erp.dashboard.cong-no');
Route::post('/api/erp/dashboard/chart', [ERPDashboardController::class, 'apiChart'])->name('api.erp.dashboard.chart');

// ============================
// MODULE QUẢN LÝ NHÂN SỰ
// ============================

// Hướng dẫn HR
Route::get('/hr/huong-dan', function() {
    return view('admin.hr.huong-dan');
})->name('hr.huong-dan');

// Chấm công
Route::get('/hr/cham-cong', [ChamCongController::class, 'index'])->name('hr.cham-cong.index');
Route::post('/api/hr/cham-cong/store', [ChamCongController::class, 'store'])->name('api.hr.cham-cong.store');
Route::post('/api/hr/cham-cong/update/{id}', [ChamCongController::class, 'update'])->name('api.hr.cham-cong.update');
Route::post('/api/hr/cham-cong/approve/{id}', [ChamCongController::class, 'approve'])->name('api.hr.cham-cong.approve');
Route::post('/api/hr/cham-cong/delete/{id}', [ChamCongController::class, 'destroy'])->name('api.hr.cham-cong.delete');
Route::post('/api/hr/cham-cong/by-date-range', [ChamCongController::class, 'getByDateRange'])->name('api.hr.cham-cong.by-date-range');

// Bảng lương
Route::get('/hr/bang-luong', [BangLuongController::class, 'index'])->name('hr.bang-luong.index');
Route::post('/api/hr/bang-luong/tinh-luong', [BangLuongController::class, 'tinhLuong'])->name('api.hr.bang-luong.tinh-luong');
Route::post('/api/hr/bang-luong/tinh-luong-toan-bo', [BangLuongController::class, 'tinhLuongToanBo'])->name('api.hr.bang-luong.tinh-luong-toan-bo');
Route::post('/api/hr/bang-luong/approve/{id}', [BangLuongController::class, 'approve'])->name('api.hr.bang-luong.approve');
Route::post('/api/hr/bang-luong/mark-paid/{id}', [BangLuongController::class, 'markPaid'])->name('api.hr.bang-luong.mark-paid');
Route::get('/api/hr/bang-luong/show/{id}', [BangLuongController::class, 'show'])->name('api.hr.bang-luong.show');
Route::post('/api/hr/bang-luong/update/{id}', [BangLuongController::class, 'update'])->name('api.hr.bang-luong.update');
Route::post('/api/hr/bang-luong/delete/{id}', [BangLuongController::class, 'destroy'])->name('api.hr.bang-luong.delete');

// Nghỉ phép
Route::get('/hr/nghi-phep', [NghiPhepController::class, 'index'])->name('hr.nghi-phep.index');
Route::post('/api/hr/nghi-phep/store', [NghiPhepController::class, 'store'])->name('api.hr.nghi-phep.store');
Route::post('/api/hr/nghi-phep/approve/{id}', [NghiPhepController::class, 'approve'])->name('api.hr.nghi-phep.approve');
Route::post('/api/hr/nghi-phep/reject/{id}', [NghiPhepController::class, 'reject'])->name('api.hr.nghi-phep.reject');
Route::post('/api/hr/nghi-phep/delete/{id}', [NghiPhepController::class, 'destroy'])->name('api.hr.nghi-phep.delete');

// Ca làm việc
Route::get('/api/hr/ca-lam-viec', [CaLamViecController::class, 'index'])->name('api.hr.ca-lam-viec.index');
Route::post('/api/hr/ca-lam-viec/store', [CaLamViecController::class, 'store'])->name('api.hr.ca-lam-viec.store');
Route::post('/api/hr/ca-lam-viec/update/{id}', [CaLamViecController::class, 'update'])->name('api.hr.ca-lam-viec.update');
Route::post('/api/hr/ca-lam-viec/delete/{id}', [CaLamViecController::class, 'destroy'])->name('api.hr.ca-lam-viec.delete');

// Phân ca
Route::get('/api/hr/phan-ca', [CaLamViecController::class, 'phanCaIndex'])->name('api.hr.phan-ca.index');
Route::post('/api/hr/phan-ca/store', [CaLamViecController::class, 'phanCaStore'])->name('api.hr.phan-ca.store');
Route::post('/api/hr/phan-ca/delete/{id}', [CaLamViecController::class, 'phanCaDestroy'])->name('api.hr.phan-ca.delete');

// Báo cáo nhân sự
Route::get('/hr/bao-cao', [BaoCaoNhanSuController::class, 'dashboard'])->name('hr.bao-cao.dashboard');
Route::get('/api/hr/bao-cao/dashboard', [BaoCaoNhanSuController::class, 'dashboard'])->name('api.hr.bao-cao.dashboard');
Route::get('/api/hr/bao-cao/by-chi-nhanh', [BaoCaoNhanSuController::class, 'byChiNhanh'])->name('api.hr.bao-cao.by-chi-nhanh');
Route::get('/api/hr/bao-cao/cham-cong', [BaoCaoNhanSuController::class, 'baoCaoChamCong'])->name('api.hr.bao-cao.cham-cong');
Route::get('/api/hr/bao-cao/luong', [BaoCaoNhanSuController::class, 'baoCaoLuong'])->name('api.hr.bao-cao.luong');
Route::get('/api/hr/bao-cao/nghi-phep', [BaoCaoNhanSuController::class, 'baoCaoNghiPhep'])->name('api.hr.bao-cao.nghi-phep');

// ============================
// MODULE QUẢN LÝ BÁN HÀNG
// ============================

use App\Http\Controllers\Sales\KhachHangController;
use App\Http\Controllers\Sales\DonHangController;
use App\Http\Controllers\Sales\PhieuThuController;
use App\Http\Controllers\Sales\KhuyenMaiController;

// Khách hàng
Route::get('/api/sales/khach-hang', [KhachHangController::class, 'index']);
Route::post('/api/sales/khach-hang/store', [KhachHangController::class, 'store']);
Route::post('/api/sales/khach-hang/update/{id}', [KhachHangController::class, 'update']);
Route::post('/api/sales/khach-hang/delete/{id}', [KhachHangController::class, 'destroy']);

// Đơn hàng
Route::get('/api/sales/don-hang', [DonHangController::class, 'index']);
Route::post('/api/sales/don-hang/store', [DonHangController::class, 'store']);
Route::post('/api/sales/don-hang/update/{id}', [DonHangController::class, 'update']);
Route::post('/api/sales/don-hang/update-status/{id}', [DonHangController::class, 'updateStatus']);
Route::post('/api/sales/don-hang/cancel/{id}', [DonHangController::class, 'cancel']);
Route::get('/api/sales/don-hang/bao-cao', [DonHangController::class, 'baoCao']);

// Phiếu thu
Route::get('/api/sales/phieu-thu', [PhieuThuController::class, 'index']);
Route::post('/api/sales/phieu-thu/store', [PhieuThuController::class, 'store']);
Route::post('/api/sales/phieu-thu/approve/{id}', [PhieuThuController::class, 'approve']);

// Khuyến mãi
Route::get('/api/sales/khuyen-mai/chuong-trinh', [KhuyenMaiController::class, 'chuongTrinhIndex']);
Route::post('/api/sales/khuyen-mai/chuong-trinh/store', [KhuyenMaiController::class, 'chuongTrinhStore']);
Route::get('/api/sales/khuyen-mai/ma-giam-gia', [KhuyenMaiController::class, 'maGiamGiaIndex']);
Route::post('/api/sales/khuyen-mai/ma-giam-gia/store', [KhuyenMaiController::class, 'maGiamGiaStore']);
Route::post('/api/sales/khuyen-mai/kiem-tra', [KhuyenMaiController::class, 'kiemTraMaGiamGia']);


// ============================
// MODULE QUẢN LÝ KINH DOANH
// ============================

use App\Http\Controllers\Business\CoHoiKinhDoanhController;
use App\Http\Controllers\Business\BaoGiaController;

// Cơ hội kinh doanh
Route::get('/api/business/co-hoi', [CoHoiKinhDoanhController::class, 'index']);
Route::post('/api/business/co-hoi/store', [CoHoiKinhDoanhController::class, 'store']);
Route::post('/api/business/co-hoi/update/{id}', [CoHoiKinhDoanhController::class, 'update']);
Route::post('/api/business/co-hoi/update-giai-doan/{id}', [CoHoiKinhDoanhController::class, 'updateGiaiDoan']);
Route::post('/api/business/co-hoi/delete/{id}', [CoHoiKinhDoanhController::class, 'destroy']);
Route::get('/api/business/co-hoi/bao-cao', [CoHoiKinhDoanhController::class, 'baoCao']);

// Báo giá
Route::get('/api/business/bao-gia', [BaoGiaController::class, 'index']);
Route::post('/api/business/bao-gia/store', [BaoGiaController::class, 'store']);
Route::post('/api/business/bao-gia/update/{id}', [BaoGiaController::class, 'update']);
Route::post('/api/business/bao-gia/update-status/{id}', [BaoGiaController::class, 'updateStatus']);
Route::post('/api/business/bao-gia/delete/{id}', [BaoGiaController::class, 'destroy']);


// ============================
// MODULE TELESALE
// ============================

use App\Http\Controllers\Telesale\DataKhachHangController;
use App\Http\Controllers\Telesale\CuocGoiController;
use App\Http\Controllers\Telesale\DonHangTelesaleController;

// Data khách hàng
Route::get('/api/telesale/data-khach-hang', [DataKhachHangController::class, 'index']);
Route::post('/api/telesale/data-khach-hang/store', [DataKhachHangController::class, 'store']);
Route::post('/api/telesale/data-khach-hang/update/{id}', [DataKhachHangController::class, 'update']);
Route::post('/api/telesale/data-khach-hang/delete/{id}', [DataKhachHangController::class, 'destroy']);
Route::post('/api/telesale/data-khach-hang/phan-bo', [DataKhachHangController::class, 'phanBo']);
Route::post('/api/telesale/data-khach-hang/import', [DataKhachHangController::class, 'import']);

// Cuộc gọi
Route::get('/api/telesale/cuoc-goi', [CuocGoiController::class, 'index']);
Route::post('/api/telesale/cuoc-goi/store', [CuocGoiController::class, 'store']);
Route::get('/api/telesale/cuoc-goi/bao-cao', [CuocGoiController::class, 'baoCao']);

// Đơn hàng telesale
Route::get('/api/telesale/don-hang', [DonHangTelesaleController::class, 'index']);
Route::post('/api/telesale/don-hang/store', [DonHangTelesaleController::class, 'store']);
Route::post('/api/telesale/don-hang/update-status/{id}', [DonHangTelesaleController::class, 'updateStatus']);
Route::get('/api/telesale/don-hang/bao-cao', [DonHangTelesaleController::class, 'baoCao']);

// ============================
// MODULE QUẢN LÝ TÀI LIỆU
// ============================

use App\Http\Controllers\Document\ThuMucController;
use App\Http\Controllers\Document\FileController;
use App\Http\Controllers\Document\PhanQuyenController;
use App\Http\Controllers\Document\ShareLinkController;

// Test route
Route::get('/test-db', function () {
    $folders = \App\Models\Document\ThuMuc::root()->get();
    $files = \App\Models\Document\File::limit(10)->get();
    return response()->json([
        'folders_count' => $folders->count(),
        'folders' => $folders,
        'files_count' => $files->count(),
        'files' => $files,
        'user_id' => auth('admin_users')->id(),
    ]);
});

// Thư mục
Route::get('/documents/folders', [ThuMucController::class, 'index']);
Route::post('/documents/folders/store', [ThuMucController::class, 'store']);
Route::post('/documents/folders/update/{id}', [ThuMucController::class, 'update']);
Route::post('/documents/folders/sort-order', [ThuMucController::class, 'updateSortOrder']);
Route::post('/documents/folders/share/{id}', [ThuMucController::class, 'share']);
Route::get('/documents/folders/shared', [ThuMucController::class, 'sharedWithMe']);
Route::get('/documents/folders/public', [ThuMucController::class, 'publicFolders']);
Route::post('/documents/folders/delete/{id}', [ThuMucController::class, 'destroy']);
Route::post('/documents/folders/restore/{id}', [ThuMucController::class, 'restore']);

// Users list for sharing
Route::get('/documents/users', function () {
    try {
        $users = \App\Models\AdminUser::select('id', 'name', 'email')
            ->where('da_nghi_lam', 0) // Only active employees
            ->orderBy('name')
            ->get();
        
        return response()->json($users);
    } catch (\Exception $e) {
        \Log::error('Get users error: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// File
Route::get('/documents/files', [FileController::class, 'index']);
Route::post('/documents/files/upload', [FileController::class, 'upload']);
Route::get('/documents/files/download/{id}', [FileController::class, 'download']);
Route::get('/documents/files/preview/{id}', [FileController::class, 'preview']);
Route::post('/documents/files/update/{id}', [FileController::class, 'update']);
Route::post('/documents/files/star/{id}', [FileController::class, 'toggleStar']);
Route::post('/documents/files/move/{id}', [FileController::class, 'move']);
Route::post('/documents/files/copy/{id}', [FileController::class, 'copy']);
Route::post('/documents/files/delete/{id}', [FileController::class, 'destroy']);
Route::post('/documents/files/restore/{id}', [FileController::class, 'restore']);
Route::get('/documents/files/starred', [FileController::class, 'starred']);
Route::get('/documents/files/recent', [FileController::class, 'recent']);
Route::get('/documents/files/trash', [FileController::class, 'trash']);

// Quota & Settings
Route::get('/documents/quota/me', function () {
    $userId = auth('admin_users')->id();
    $quota = \App\Models\Document\Quota::forUser($userId)->first();

    if (!$quota) {
        // Auto-create quota if not exists
        $quota = \App\Models\Document\Quota::create([
            'user_id' => $userId,
            'loai' => 'user',
            'dung_luong_gioi_han' => 10737418240, // 10GB
            'dung_luong_su_dung' => 0,
            'ty_le_su_dung' => 0,
            'canh_bao_tu' => 80,
            'da_canh_bao' => false,
        ]);

        // Calculate actual usage
        $actualUsage = \App\Models\Document\File::where('nguoi_tai_len_id', $userId)
            ->sum('kich_thuoc');
        $quota->dung_luong_su_dung = $actualUsage;
        $quota->ty_le_su_dung = ($actualUsage / $quota->dung_luong_gioi_han) * 100;
        $quota->save();
    }

    return response()->json($quota);
});

// Phân quyền
Route::get('/documents/permissions', [PhanQuyenController::class, 'index']);
Route::post('/documents/permissions/share', [PhanQuyenController::class, 'share']);
Route::post('/documents/permissions/update/{id}', [PhanQuyenController::class, 'update']);
Route::post('/documents/permissions/revoke/{id}', [PhanQuyenController::class, 'revoke']);

// Share link (public)
Route::post('/documents/share-link/create', [ShareLinkController::class, 'create']);
Route::get('/documents/share-link', [ShareLinkController::class, 'index']);
Route::get('/share/{hash}', [ShareLinkController::class, 'access'])->name('share.access'); // Public route
Route::post('/documents/share-link/revoke/{id}', [ShareLinkController::class, 'revoke']);

// Comments (Bình luận)
Route::get('/documents/comments', [BinhLuanController::class, 'index']);
Route::post('/documents/comments', [BinhLuanController::class, 'store']);
Route::post('/documents/comments/update/{id}', [BinhLuanController::class, 'update']);
Route::post('/documents/comments/delete/{id}', [BinhLuanController::class, 'destroy']);
Route::post('/documents/comments/toggle-resolve/{id}', [BinhLuanController::class, 'toggleResolve']);
Route::get('/documents/comments/unresolved-count', [BinhLuanController::class, 'unresolvedCount']);

// ============================
// MODULE WHMCS (Billing & Hosting Management)
// ============================

use App\Http\Controllers\Admin\Whmcs\InvoiceController as WhmcsInvoiceController;
use App\Http\Controllers\Admin\Whmcs\ServerController as WhmcsServerController;
use App\Http\Controllers\Admin\Whmcs\ServiceController as WhmcsServiceController;
use App\Http\Controllers\Admin\Whmcs\ProductController as WhmcsProductController;
use App\Http\Controllers\Admin\Whmcs\ClientController as WhmcsClientController;

// Invoices
Route::prefix('whmcs/invoices')->group(function () {
    Route::get('/', [WhmcsInvoiceController::class, 'index'])->name('whmcs.invoices.index');
    Route::post('/', [WhmcsInvoiceController::class, 'store'])->name('whmcs.invoices.store');
    Route::get('/{id}', [WhmcsInvoiceController::class, 'show'])->name('whmcs.invoices.show');
    Route::post('/{id}/payment', [WhmcsInvoiceController::class, 'recordPayment'])->name('whmcs.invoices.payment');
    Route::post('/{id}/cancel', [WhmcsInvoiceController::class, 'cancel'])->name('whmcs.invoices.cancel');
    Route::post('/{id}/send-reminder', [WhmcsInvoiceController::class, 'sendReminder'])->name('whmcs.invoices.reminder');
    Route::post('/{id}/apply-credit', [WhmcsInvoiceController::class, 'applyCredit'])->name('whmcs.invoices.apply-credit');
    Route::get('/overdue/list', [WhmcsInvoiceController::class, 'overdue'])->name('whmcs.invoices.overdue');
    Route::get('/revenue/stats', [WhmcsInvoiceController::class, 'revenue'])->name('whmcs.invoices.revenue');
});

// Servers
Route::prefix('whmcs/servers')->group(function () {
    Route::get('/', [WhmcsServerController::class, 'index'])->name('whmcs.servers.index');
    Route::post('/', [WhmcsServerController::class, 'store'])->name('whmcs.servers.store');
    Route::get('/{id}', [WhmcsServerController::class, 'show'])->name('whmcs.servers.show');
    Route::put('/{id}', [WhmcsServerController::class, 'update'])->name('whmcs.servers.update');
    Route::delete('/{id}', [WhmcsServerController::class, 'destroy'])->name('whmcs.servers.destroy');
    Route::post('/{id}/test-connection', [WhmcsServerController::class, 'testConnection'])->name('whmcs.servers.test');
    Route::post('/{id}/sync-accounts', [WhmcsServerController::class, 'syncAccounts'])->name('whmcs.servers.sync');
    Route::post('/{id}/update-status', [WhmcsServerController::class, 'updateStatus'])->name('whmcs.servers.status');
    Route::get('/recommendations/find', [WhmcsServerController::class, 'recommendations'])->name('whmcs.servers.recommendations');
});

// Server Groups
Route::prefix('whmcs/server-groups')->group(function () {
    Route::get('/', [WhmcsServerController::class, 'groups'])->name('whmcs.server-groups.index');
    Route::post('/', [WhmcsServerController::class, 'storeGroup'])->name('whmcs.server-groups.store');
    Route::put('/{id}', [WhmcsServerController::class, 'updateGroup'])->name('whmcs.server-groups.update');
    Route::delete('/{id}', [WhmcsServerController::class, 'destroyGroup'])->name('whmcs.server-groups.destroy');
});

// Clients (Users for WHMCS)
Route::prefix('whmcs/clients')->group(function () {
    Route::get('/', [WhmcsClientController::class, 'index'])->name('whmcs.clients.index');
    Route::get('/{id}', [WhmcsClientController::class, 'show'])->name('whmcs.clients.show');
});

// Services
Route::prefix('whmcs/services')->group(function () {
    Route::get('/', [WhmcsServiceController::class, 'index'])->name('whmcs.services.index');
    Route::post('/', [WhmcsServiceController::class, 'store'])->name('whmcs.services.store');
    Route::get('/{id}', [WhmcsServiceController::class, 'show'])->name('whmcs.services.show');
    Route::put('/{id}', [WhmcsServiceController::class, 'update'])->name('whmcs.services.update');
    Route::post('/{id}/provision', [WhmcsServiceController::class, 'provision'])->name('whmcs.services.provision');
    Route::post('/{id}/suspend', [WhmcsServiceController::class, 'suspend'])->name('whmcs.services.suspend');
    Route::post('/{id}/unsuspend', [WhmcsServiceController::class, 'unsuspend'])->name('whmcs.services.unsuspend');
    Route::post('/{id}/terminate', [WhmcsServiceController::class, 'terminate'])->name('whmcs.services.terminate');
    Route::post('/{id}/change-password', [WhmcsServiceController::class, 'changePassword'])->name('whmcs.services.change-password');
    Route::post('/{id}/change-package', [WhmcsServiceController::class, 'changePackage'])->name('whmcs.services.change-package');
    Route::get('/{id}/credentials', [WhmcsServiceController::class, 'credentials'])->name('whmcs.services.credentials');
});

// Products
Route::prefix('whmcs/products')->group(function () {
    Route::get('/', [WhmcsProductController::class, 'index'])->name('whmcs.products.index');
    Route::post('/', [WhmcsProductController::class, 'store'])->name('whmcs.products.store');
    Route::get('/{id}', [WhmcsProductController::class, 'show'])->name('whmcs.products.show');
    Route::put('/{id}', [WhmcsProductController::class, 'update'])->name('whmcs.products.update');
    Route::delete('/{id}', [WhmcsProductController::class, 'destroy'])->name('whmcs.products.destroy');
    Route::post('/{id}/pricing', [WhmcsProductController::class, 'updatePricing'])->name('whmcs.products.pricing');
    Route::delete('/{id}/pricing/{pricingId}', [WhmcsProductController::class, 'deletePricing'])->name('whmcs.products.pricing.delete');
});

// Product Groups
Route::prefix('whmcs/product-groups')->group(function () {
    Route::get('/', [WhmcsProductController::class, 'groups'])->name('whmcs.product-groups.index');
    Route::post('/', [WhmcsProductController::class, 'storeGroup'])->name('whmcs.product-groups.store');
    Route::put('/{id}', [WhmcsProductController::class, 'updateGroup'])->name('whmcs.product-groups.update');
    Route::delete('/{id}', [WhmcsProductController::class, 'destroyGroup'])->name('whmcs.product-groups.destroy');
});

// Tickets (Admin)
Route::prefix('whmcs/tickets')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'index'])->name('whmcs.tickets.index');
    Route::get('/{id}', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'show'])->name('whmcs.tickets.show');
    Route::post('/{id}/assign', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'assign'])->name('whmcs.tickets.assign');
    Route::post('/{id}/reply', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'reply'])->name('whmcs.tickets.reply');
    Route::put('/{id}/status', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'updateStatus'])->name('whmcs.tickets.status');
    Route::put('/{id}/priority', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'updatePriority'])->name('whmcs.tickets.priority');
    Route::post('/{id}/close', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'close'])->name('whmcs.tickets.close');
    Route::post('/{id}/reopen', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'reopen'])->name('whmcs.tickets.reopen');
    Route::delete('/{id}', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'destroy'])->name('whmcs.tickets.destroy');
    Route::get('/statistics/all', [\App\Http\Controllers\Admin\Whmcs\TicketController::class, 'statistics'])->name('whmcs.tickets.statistics');
});

// API Key Management
Route::prefix('whmcs/api-keys')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\ApiKeyController::class, 'index'])->name('whmcs.api-keys.index');
    Route::post('/', [\App\Http\Controllers\Admin\ApiKeyController::class, 'store'])->name('whmcs.api-keys.store');
    Route::get('/{id}', [\App\Http\Controllers\Admin\ApiKeyController::class, 'show'])->name('whmcs.api-keys.show');
    Route::put('/{id}', [\App\Http\Controllers\Admin\ApiKeyController::class, 'update'])->name('whmcs.api-keys.update');
    Route::post('/{id}/revoke', [\App\Http\Controllers\Admin\ApiKeyController::class, 'revoke'])->name('whmcs.api-keys.revoke');
    Route::post('/{id}/regenerate', [\App\Http\Controllers\Admin\ApiKeyController::class, 'regenerateSecret'])->name('whmcs.api-keys.regenerate');
    Route::delete('/{id}', [\App\Http\Controllers\Admin\ApiKeyController::class, 'destroy'])->name('whmcs.api-keys.destroy');
    Route::get('/{id}/statistics', [\App\Http\Controllers\Admin\ApiKeyController::class, 'statistics'])->name('whmcs.api-keys.statistics');
    Route::get('/{id}/logs', [\App\Http\Controllers\Admin\ApiKeyController::class, 'logs'])->name('whmcs.api-keys.logs');
});

// Webhooks Management
Route::prefix('whmcs/webhooks')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\WebhookController::class, 'index'])->name('whmcs.webhooks.index');
    Route::post('/', [\App\Http\Controllers\Admin\WebhookController::class, 'store'])->name('whmcs.webhooks.store');
    Route::get('/events', [\App\Http\Controllers\Admin\WebhookController::class, 'availableEvents'])->name('whmcs.webhooks.events');
    Route::get('/{id}', [\App\Http\Controllers\Admin\WebhookController::class, 'show'])->name('whmcs.webhooks.show');
    Route::put('/{id}', [\App\Http\Controllers\Admin\WebhookController::class, 'update'])->name('whmcs.webhooks.update');
    Route::delete('/{id}', [\App\Http\Controllers\Admin\WebhookController::class, 'destroy'])->name('whmcs.webhooks.destroy');
    Route::post('/{id}/toggle', [\App\Http\Controllers\Admin\WebhookController::class, 'toggleActive'])->name('whmcs.webhooks.toggle');
    Route::post('/{id}/test', [\App\Http\Controllers\Admin\WebhookController::class, 'test'])->name('whmcs.webhooks.test');
    Route::get('/{id}/logs', [\App\Http\Controllers\Admin\WebhookController::class, 'logs'])->name('whmcs.webhooks.logs');
    Route::post('/{id}/logs/{logId}/retry', [\App\Http\Controllers\Admin\WebhookController::class, 'retry'])->name('whmcs.webhooks.retry');
});

// Analytics Dashboard
Route::prefix('whmcs/analytics')->group(function () {
    Route::get('/overview', [\App\Http\Controllers\Admin\AnalyticsController::class, 'overview'])->name('whmcs.analytics.overview');
    Route::get('/revenue', [\App\Http\Controllers\Admin\AnalyticsController::class, 'revenue'])->name('whmcs.analytics.revenue');
    Route::get('/top-customers', [\App\Http\Controllers\Admin\AnalyticsController::class, 'topCustomers'])->name('whmcs.analytics.top-customers');
    Route::get('/churn-rate', [\App\Http\Controllers\Admin\AnalyticsController::class, 'churnRate'])->name('whmcs.analytics.churn-rate');
    Route::get('/payment-methods', [\App\Http\Controllers\Admin\AnalyticsController::class, 'paymentMethods'])->name('whmcs.analytics.payment-methods');
    Route::get('/customer-growth', [\App\Http\Controllers\Admin\AnalyticsController::class, 'customerGrowth'])->name('whmcs.analytics.customer-growth');
    Route::get('/product-performance', [\App\Http\Controllers\Admin\AnalyticsController::class, 'productPerformance'])->name('whmcs.analytics.product-performance');
    Route::get('/export', [\App\Http\Controllers\Admin\AnalyticsController::class, 'export'])->name('whmcs.analytics.export');
});

// Currency Management
Route::prefix('whmcs/currencies')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\CurrencyController::class, 'index'])->name('whmcs.currencies.index');
    Route::post('/', [\App\Http\Controllers\Admin\CurrencyController::class, 'store'])->name('whmcs.currencies.store');
    Route::get('/statistics', [\App\Http\Controllers\Admin\CurrencyController::class, 'statistics'])->name('whmcs.currencies.statistics');
    Route::post('/convert', [\App\Http\Controllers\Admin\CurrencyController::class, 'convert'])->name('whmcs.currencies.convert');
    Route::post('/update-rates', [\App\Http\Controllers\Admin\CurrencyController::class, 'updateRates'])->name('whmcs.currencies.update-rates');
    Route::get('/{id}', [\App\Http\Controllers\Admin\CurrencyController::class, 'show'])->name('whmcs.currencies.show');
    Route::put('/{id}', [\App\Http\Controllers\Admin\CurrencyController::class, 'update'])->name('whmcs.currencies.update');
    Route::delete('/{id}', [\App\Http\Controllers\Admin\CurrencyController::class, 'destroy'])->name('whmcs.currencies.destroy');
    Route::post('/{id}/set-base', [\App\Http\Controllers\Admin\CurrencyController::class, 'setBase'])->name('whmcs.currencies.set-base');
});

// Tax Management
Route::prefix('whmcs/tax')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\TaxController::class, 'index'])->name('whmcs.tax.index');
    Route::post('/', [\App\Http\Controllers\Admin\TaxController::class, 'store'])->name('whmcs.tax.store');
    Route::get('/statistics', [\App\Http\Controllers\Admin\TaxController::class, 'statistics'])->name('whmcs.tax.statistics');
    Route::get('/report', [\App\Http\Controllers\Admin\TaxController::class, 'report'])->name('whmcs.tax.report');
    Route::post('/preview', [\App\Http\Controllers\Admin\TaxController::class, 'preview'])->name('whmcs.tax.preview');
    Route::post('/assign-product', [\App\Http\Controllers\Admin\TaxController::class, 'assignToProduct'])->name('whmcs.tax.assign-product');
    Route::post('/remove-product', [\App\Http\Controllers\Admin\TaxController::class, 'removeFromProduct'])->name('whmcs.tax.remove-product');
    Route::get('/{id}', [\App\Http\Controllers\Admin\TaxController::class, 'show'])->name('whmcs.tax.show');
    Route::put('/{id}', [\App\Http\Controllers\Admin\TaxController::class, 'update'])->name('whmcs.tax.update');
    Route::delete('/{id}', [\App\Http\Controllers\Admin\TaxController::class, 'destroy'])->name('whmcs.tax.destroy');
});

// Affiliate System
Route::prefix('whmcs/affiliate')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AffiliateController::class, 'index'])->name('whmcs.affiliate.index');
    Route::post('/', [\App\Http\Controllers\Admin\AffiliateController::class, 'store'])->name('whmcs.affiliate.store');
    Route::get('/overview', [\App\Http\Controllers\Admin\AffiliateController::class, 'overview'])->name('whmcs.affiliate.overview');
    Route::get('/top-affiliates', [\App\Http\Controllers\Admin\AffiliateController::class, 'topAffiliates'])->name('whmcs.affiliate.top');
    Route::get('/payouts', [\App\Http\Controllers\Admin\AffiliateController::class, 'payouts'])->name('whmcs.affiliate.payouts');
    Route::post('/request-payout', [\App\Http\Controllers\Admin\AffiliateController::class, 'requestPayout'])->name('whmcs.affiliate.request-payout');
    Route::post('/approve-payout/{id}', [\App\Http\Controllers\Admin\AffiliateController::class, 'approvePayout'])->name('whmcs.affiliate.approve-payout');
    Route::post('/reject-payout/{id}', [\App\Http\Controllers\Admin\AffiliateController::class, 'rejectPayout'])->name('whmcs.affiliate.reject-payout');
    Route::get('/{id}', [\App\Http\Controllers\Admin\AffiliateController::class, 'show'])->name('whmcs.affiliate.show');
    Route::put('/{id}', [\App\Http\Controllers\Admin\AffiliateController::class, 'update'])->name('whmcs.affiliate.update');
    Route::delete('/{id}', [\App\Http\Controllers\Admin\AffiliateController::class, 'destroy'])->name('whmcs.affiliate.destroy');
    Route::get('/{id}/statistics', [\App\Http\Controllers\Admin\AffiliateController::class, 'statistics'])->name('whmcs.affiliate.statistics');
    Route::get('/{id}/referrals', [\App\Http\Controllers\Admin\AffiliateController::class, 'referrals'])->name('whmcs.affiliate.referrals');
});

// Knowledge Base
Route::prefix('whmcs/kb')->group(function () {
    // Categories
    Route::get('/categories', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'categories'])->name('whmcs.kb.categories');
    Route::post('/categories', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'storeCategory'])->name('whmcs.kb.category.store');
    Route::put('/categories/{id}', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'updateCategory'])->name('whmcs.kb.category.update');
    Route::delete('/categories/{id}', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'deleteCategory'])->name('whmcs.kb.category.delete');
    
    // Articles
    Route::get('/articles', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'articles'])->name('whmcs.kb.articles');
    Route::post('/articles', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'storeArticle'])->name('whmcs.kb.article.store');
    Route::get('/articles/search', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'search'])->name('whmcs.kb.articles.search');
    Route::get('/articles/popular', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'popular'])->name('whmcs.kb.articles.popular');
    Route::get('/articles/recent', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'recent'])->name('whmcs.kb.articles.recent');
    Route::get('/articles/{id}', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'showArticle'])->name('whmcs.kb.article.show');
    Route::put('/articles/{id}', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'updateArticle'])->name('whmcs.kb.article.update');
    Route::delete('/articles/{id}', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'deleteArticle'])->name('whmcs.kb.article.delete');
    Route::post('/articles/{id}/views', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'incrementViews'])->name('whmcs.kb.article.views');
    Route::post('/articles/{id}/vote', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'vote'])->name('whmcs.kb.article.vote');
    
    // Attachments
    Route::post('/articles/{id}/attachments', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'uploadAttachment'])->name('whmcs.kb.attachment.upload');
    Route::delete('/attachments/{id}', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'deleteAttachment'])->name('whmcs.kb.attachment.delete');
    
    // Statistics
    Route::get('/statistics', [\App\Http\Controllers\Admin\KnowledgeBaseController::class, 'statistics'])->name('whmcs.kb.statistics');
});
