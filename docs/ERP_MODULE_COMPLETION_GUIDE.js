/**
 * FILE TÀI LIỆU HƯỚNG DẪN HOÀN THIỆN MODULE TÀI CHÍNH
 *
 * ĐÃ TẠO:
 * ========
 * 1. QUẢN LÝ NGÂN HÀNG:
 *    - Migration: tai_khoan_ngan_hang, giao_dich_ngan_hang, doi_soat_ngan_hang
 *    - Models: TaiKhoanNganHang, GiaoDichNganHang, DoiSoatNganHang
 *    - Controllers: TaiKhoanNganHangController, GiaoDichNganHangController
 *
 * 2. HÓA ĐƠN:
 *    - Migration: hoa_don, hoa_don_chi_tiet
 *
 * CẦN BỔ SUNG:
 * ===========
 *
 * A. ROUTES (thêm vào routes/admin_route.php):
 */

// Ngân hàng - Tài khoản
Route::get('/bank/account', [TaiKhoanNganHangController::class, 'index'])->name('bank.account');
Route::post('/api/bank/account/list', [TaiKhoanNganHangController::class, 'apiList']);
Route::post('/api/bank/account/add', [TaiKhoanNganHangController::class, 'apiAdd']);
Route::post('/api/bank/account/update', [TaiKhoanNganHangController::class, 'apiUpdate']);
Route::post('/api/bank/account/delete', [TaiKhoanNganHangController::class, 'apiDelete']);
Route::post('/api/bank/account/update-sort-order', [TaiKhoanNganHangController::class, 'apiUpdateSortOrder']);

// Ngân hàng - Giao dịch
Route::get('/bank/transaction', [GiaoDichNganHangController::class, 'index'])->name('bank.transaction');
Route::post('/api/bank/transaction/list', [GiaoDichNganHangController::class, 'apiList']);
Route::post('/api/bank/transaction/add', [GiaoDichNganHangController::class, 'apiAdd']);
Route::post('/api/bank/transaction/update', [GiaoDichNganHangController::class, 'apiUpdate']);
Route::post('/api/bank/transaction/delete', [GiaoDichNganHangController::class, 'apiDelete']);
Route::post('/api/bank/transaction/tai-khoan-list', [GiaoDichNganHangController::class, 'apiTaiKhoanList']);

// Hóa đơn
Route::get('/invoice', [HoaDonController::class, 'index'])->name('invoice');
Route::post('/api/invoice/list', [HoaDonController::class, 'apiList']);
Route::post('/api/invoice/add', [HoaDonController::class, 'apiAdd']);
Route::post('/api/invoice/update', [HoaDonController::class, 'apiUpdate']);
Route::post('/api/invoice/delete', [HoaDonController::class, 'apiDelete']);
Route::post('/api/invoice/detail', [HoaDonController::class, 'apiDetail']);
Route::post('/api/invoice/thanh-toan', [HoaDonController::class, 'apiThanhToan']);

// Báo cáo tài chính
Route::get('/erp/dashboard', [ERPDashboardController::class, 'index'])->name('erp.dashboard');
Route::post('/api/erp/dashboard/overview', [ERPDashboardController::class, 'apiOverview']);
Route::post('/api/erp/dashboard/cash-flow', [ERPDashboardController::class, 'apiCashFlow']);
Route::post('/api/erp/dashboard/cong-no', [ERPDashboardController::class, 'apiCongNo']);

/**
 * B. CẬP NHẬT MENU (resources/js/common/menu.jsx):
 */

/*
erp: [
    {
        label: <Link to={`${ROUTE.dashboard}?p=home`}>Home</Link>,
        icon: <HomeOutlined />,
        key: (key++).toString(),
    },
    {
        label: <Link to={`${ROUTE.erpDashboard}?p=erp`}>Dashboard</Link>,
        key: (key++).toString(),
        icon: <DashboardOutlined />,
    },
    {
        label: "Giao dịch",
        key: (key++).toString(),
        icon: <FileTextOutlined />,
        children: [
            {
                label: <Link to={`${ROUTE.aitilen_soQuy}?p=erp`}>Sổ quỹ (Thu/Chi)</Link>,
                key: (key++).toString(),
                icon: <WalletOutlined />,
            },
            {
                label: <Link to={`${ROUTE.bankTransaction}?p=erp`}>Giao dịch ngân hàng</Link>,
                key: (key++).toString(),
                icon: <BankOutlined />,
            },
            {
                label: <Link to={`${ROUTE.invoiceManagement}?p=erp`}>Hóa đơn</Link>,
                key: (key++).toString(),
                icon: <FileDoneOutlined />,
            },
        ],
    },
    {
        label: <Link to={`${ROUTE.congNoManagement}?p=erp`}>Công nợ</Link>,
        key: (key++).toString(),
        icon: <TagsOutlined />,
    },
    {
        label: "Cài đặt",
        key: (key++).toString(),
        icon: <SettingFilled />,
        children: [
            {
                label: <Link to={`${ROUTE.bankAccount}?p=erp`}>Tài khoản ngân hàng</Link>,
                key: (key++).toString(),
                icon: <BankOutlined />,
            },
            {
                label: <Link to={`${ROUTE.baseRoute}setting/nha_cung_cap?p=erp`}>Đối tác</Link>,
                key: (key++).toString(),
                icon: <TeamOutlined />,
            },
            {
                label: <Link to={`${ROUTE.baseRoute}setting/loai_thu?p=erp`}>Loại thu</Link>,
                key: (key++).toString(),
                icon: <RiseOutlined />,
            },
            {
                label: <Link to={`${ROUTE.baseRoute}setting/loai_chi?p=erp`}>Loại chi</Link>,
                key: (key++).toString(),
                icon: <FallOutlined />,
            },
        ],
    },
],
*/

/**
 * C. CẬP NHẬT ROUTE.JS (resources/js/common/route.js):
 */

/*
// Thêm vào object ROUTE:
bankAccount: '/admin/bank/account',
bankTransaction: '/admin/bank/transaction',
invoiceManagement: '/admin/invoice',
erpDashboard: '/admin/erp/dashboard',
*/

/**
 * D. TẠO CÁC FILE FRONTEND CẦN THIẾT:
 *
 * 1. resources/js/pages/bank/BankAccountList.tsx
 * 2. resources/js/pages/bank/BankTransactionList.tsx
 * 3. resources/js/pages/erp/InvoiceList.tsx
 * 4. resources/js/pages/erp/InvoiceForm.tsx
 * 5. resources/js/pages/erp/ERPDashboard.tsx
 *
 * 6. resources/views/admin/bank/account_list.blade.php
 * 7. resources/views/admin/bank/transaction_list.blade.php
 * 8. resources/views/admin/erp/invoice_list.blade.php
 * 9. resources/views/admin/erp/dashboard.blade.php
 */

/**
 * E. TẠO CONTROLLERS CÒN THIẾU:
 *
 * 1. app/Http/Controllers/Admin/HoaDonController.php
 * 2. app/Http/Controllers/Admin/ERPDashboardController.php
 */

/**
 * F. TẠO MODELS CÒN THIẾU:
 *
 * 1. app/Models/HoaDon.php
 * 2. app/Models/HoaDonChiTiet.php
 */

/**
 * G. CHẠY MIGRATION:
 */

// php artisan migrate

/**
 * H. CẤU TRÚC API ENDPOINTS:
 *
 * NGÂN HÀNG - TÀI KHOẢN:
 * =====================
 * POST /api/bank/account/list
 * Request: { searchData: { keyword, page, per_page } }
 * Response: { status_code, data: { datas, total } }
 *
 * POST /api/bank/account/add
 * Request: { ten_ngan_hang, so_tai_khoan, chu_tai_khoan, ... }
 * Response: { status_code, message, data }
 *
 * POST /api/bank/account/update
 * Request: { id, ten_ngan_hang, so_tai_khoan, ... }
 * Response: { status_code, message, data }
 *
 * POST /api/bank/account/delete
 * Request: { ids: [1, 2, 3] }
 * Response: { status_code, message }
 *
 *
 * NGÂN HÀNG - GIAO DỊCH:
 * =====================
 * POST /api/bank/transaction/list
 * Request: { searchData: { keyword, tai_khoan_ngan_hang_id, loai_giao_dich, tu_ngay, den_ngay, page, per_page } }
 * Response: { status_code, data: { datas, total, tong_thu, tong_chi, chenh_lech } }
 *
 * POST /api/bank/transaction/add
 * Request: { tai_khoan_ngan_hang_id, ngay_giao_dich, loai_giao_dich, so_tien, noi_dung, ... }
 * Response: { status_code, message, data }
 * Note: Tự động cập nhật số dư tài khoản
 *
 * POST /api/bank/transaction/update
 * Request: { id, tai_khoan_ngan_hang_id, ngay_giao_dich, loai_giao_dich, so_tien, noi_dung, ... }
 * Response: { status_code, message, data }
 * Note: Hoàn lại số dư cũ và cập nhật số dư mới
 *
 * POST /api/bank/transaction/delete
 * Request: { ids: [1, 2, 3] }
 * Response: { status_code, message }
 * Note: Hoàn lại số dư khi xóa
 *
 * POST /api/bank/transaction/tai-khoan-list
 * Response: { status_code, data: [...] }
 *
 *
 * HÓA ĐƠN:
 * =======
 * POST /api/invoice/list
 * Request: { searchData: { keyword, khach_hang_id, trang_thai, tu_ngay, den_ngay, page, per_page } }
 * Response: { status_code, data: { datas, total, tong_tien, da_thanh_toan, con_lai } }
 *
 * POST /api/invoice/add
 * Request: { ma_hoa_don, ngay_hoa_don, khach_hang_id, ten_khach_hang, chi_tiet: [...], ... }
 * Response: { status_code, message, data }
 * Note: Tự động tạo công nợ nếu chưa thanh toán hết
 *
 * POST /api/invoice/detail
 * Request: { id }
 * Response: { status_code, data: { hoa_don, chi_tiet } }
 *
 * POST /api/invoice/thanh-toan
 * Request: { id, so_tien, phuong_thuc, ngay_thanh_toan }
 * Response: { status_code, message, data }
 * Note: Cập nhật công nợ và trạng thái hóa đơn
 *
 *
 * DASHBOARD:
 * =========
 * POST /api/erp/dashboard/overview
 * Request: { tu_ngay, den_ngay }
 * Response: {
 *   status_code,
 *   data: {
 *     tong_thu, tong_chi, loi_nhuan,
 *     tong_cong_no, so_du_ngan_hang, so_du_quy
 *   }
 * }
 *
 * POST /api/erp/dashboard/cash-flow
 * Request: { tu_ngay, den_ngay, group_by: 'day|month' }
 * Response: { status_code, data: [{ ngay, thu, chi }, ...] }
 *
 * POST /api/erp/dashboard/cong-no
 * Request: { loai: 'phai_thu|phai_tra' }
 * Response: { status_code, data: { tong, qua_han, sap_den_han, danh_sach: [...] } }
 */
