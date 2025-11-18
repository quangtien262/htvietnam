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
Route::post('/documents/folders/force-delete/{id}', [ThuMucController::class, 'forceDelete']);

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
Route::post('/documents/files/force-delete/{id}', [FileController::class, 'forceDelete']);
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

// Admin Users Management
// Admin Users CRUD
Route::post('/api/setting/admin_users/list', [\App\Http\Controllers\Admin\AdminController::class, 'getAdminUsersList'])->name('api.admin_users.list');
Route::get('/api/setting/admin_users/{id}', [\App\Http\Controllers\Admin\AdminController::class, 'getAdminUserDetail'])->name('api.admin_users.detail');
Route::post('/api/setting/admin_users/create', [\App\Http\Controllers\Admin\AdminController::class, 'createAdminUser'])->name('api.admin_users.create');
Route::post('/api/setting/admin_users/update/{id}', [\App\Http\Controllers\Admin\AdminController::class, 'updateAdminUser'])->name('api.admin_users.update');
Route::post('/api/setting/admin_users/delete', [\App\Http\Controllers\Admin\AdminController::class, 'deleteAdminUsers'])->name('api.admin_users.delete');
Route::post('/api/setting/admin_users/select-options', [\App\Http\Controllers\Admin\AdminController::class, 'getAdminUsersSelectOptions'])->name('api.admin_users.select_options');

