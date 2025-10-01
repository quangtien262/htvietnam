<?php

use App\Http\Controllers\Admin\AdmApiController;
use App\Http\Controllers\Admin\LandingPageController;
use App\Http\Controllers\Admin\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\TblController;
use App\Http\Controllers\Admin\DataController;
use App\Http\Controllers\Admin\GmailController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AitilenController;
use App\Http\Controllers\Admin\CongNoController;
use App\Http\Controllers\Admin\DownloadController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\FileController;
use App\Http\Controllers\Admin\GoogleController;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\LuckyController;
use App\Http\Controllers\Admin\HimalayaController;
use App\Http\Controllers\Admin\HoaDonController;
use App\Http\Controllers\Admin\KhachHangController;
use App\Http\Controllers\Admin\NCCController;
use App\Http\Controllers\Admin\NhanVienController;
use App\Http\Controllers\Admin\PhieuThuController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\SoQuyController;
use App\Http\Controllers\Admin\TaiSanController;
use App\Http\Controllers\Admin\TaskController;

Route::get('/', [AdminController::class, 'index'])->name('dashboard');
Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.index');
Route::get('/setting/menu', [AdminController::class, 'settingMenu'])->name('admin.setting.menu');
Route::get('/setting/col/{tableId}', [AdminController::class, 'settingColumn'])->name('admin.setting.column');

// Route::get('get-session', [AdminController::class, 'getSession'])->name('admin.getSession');
Route::post('session/check-thu-ngan', [AdminController::class, 'checkSessionThuNgan'])->name('admin.session.checkThuNgan');
Route::post('session/seting-thu-ngan', [AdminController::class, 'setSessionThuNgan'])->name('admin.session.setThuNgan');
Route::post('session/seting-doi-ca', [AdminController::class, 'setSessionDoiCa'])->name('admin.session.setDoiCa');
Route::post('thu-ngan/ca-info', [HoaDonController::class, 'caInfo'])->name('thuNgan.caInfo');

// permission-denied
Route::get('permission-denied', [AdminController::class, 'permissionDenied'])->name('admin.permission_denied');
Route::get('page-not-found', [AdminController::class, 'pageNotFound'])->name('admin.page_not_found');


// data
Route::group(['prefix' => 'data'], function () {

    Route::get('tbl/{tblName}', [DataController::class, 'tblName'])->name('data.tblName');
    Route::get('list/{tableId}', [DataController::class, 'index'])->name('data.index');
    Route::get('detail/{tableId}/{dataId}', [DataController::class, 'detail'])->name('data.detail');
    Route::get('detail-lang/{tableId}/{dataId}', [DataController::class, 'detailLang'])->name('data.detail_lang');

    Route::get('create/{tableId}', [DataController::class, 'create'])->name('data.create');
    Route::post('store/{tableId}', [DataController::class, 'store'])->name('data.store');

    Route::get('edit/{tableId}/{dataId}', [DataController::class, 'edit'])->name('data.edit');
    Route::post('update/{tableId}/{dataId}', [DataController::class, 'update'])->name('data.update');

    Route::post('api/info/{tableId}/{dataId}', [DataController::class, 'getDataInfo'])->name('data.api.info');

    // sửa nhanh theo id bảng, tên cột cần sửa và id của bảng
    Route::post('fast-edit/{tableId}', [DataController::class, 'fastEdit'])->name('data.fastEdit');
    // sửa nhanh theo tên bảng, tên cột cần sửa và id của bảng
    Route::post('fast-edit-data', [DataController::class, 'fastEditByTableName'])->name('data.fastEditByTableName');

    Route::post('delete/{tableId}', [DataController::class, 'destroyData'])->name('data.delete');
    Route::post('search/{tableId}', [DataController::class, 'search'])->name('data.search');
    Route::post('update-sort-order/{tableId}', [DataController::class, 'updateSortOrder'])->name('data.update_sort_order');
    Route::get('/export/{tableId}', [DataController::class, 'exportExcel'])->name('data.export');

    Route::post('/update-current-col', [DataController::class, 'updateCurrentColumn'])->name('data.updateCurrentColumn');

    Route::post('/select-tb', [DataController::class, 'getDataSelectTable'])->name('data.selectTable');
    Route::post('select-table/delete', [DataController::class, 'deleteSelectTable'])->name('data.select_table.delete');

    // get ra data để show form create trên popup
    Route::post('/data-create', [DataController::class, 'dataCreate'])->name('data.data_create');

    // get data calendar. sự dụng để reload calendar sau khi create/reload
    Route::post('/get-data-calendar', [DataController::class, 'getDataCalendar'])->name('data.get_calendar');

    // thong ke
    Route::get('thong-ke/{tableId}', [DataController::class, 'thongKe'])->name('data.thong_ke');
    Route::get('show-total/{tableId}', [DataController::class, 'showTotal'])->name('data.total');

    // 
    Route::get('api/get-data-slt', [AdmApiController::class, 'getDataSelect'])->name('adm_api.select');
    Route::get('api/get-name', [AdmApiController::class, 'getName'])->name('adm_api.get_name');

});

//table config
Route::group(['prefix' => 'configtbl'], function () {
    Route::get('/', [TblController::class, 'index'])->name('table.index');
    Route::get('form/{tableId}/{columnId?}', [TblController::class, 'form'])->name('table.form');
    Route::get('form-name/{tableName}/{columnId?}', [TblController::class, 'formName'])->name('table.formName');
    Route::post('deletes', [TblController::class, 'deletes'])->name('table.deletes');
    Route::post('form/{tableId}', [TblController::class, 'submitFormTable'])->name('table.submit');
    Route::post('table/update-sort-order', [TblController::class, 'updateSortOrderTable'])->name('table.update_sort_order');

    // column
    Route::post('column/submit-form/{tableId}/{columnId}', [TblController::class, 'submitFormColumn'])->name('column.submit');
    Route::post('column/update-sort-order', [TblController::class, 'updateSortOrderColumn'])->name('column.update_sort_order');
});

//gmail
Route::group(['prefix' => 'gmail'], function () {
    Route::get('/', [GmailController::class, 'index'])->name('gmail');
    Route::get('/create', [GmailController::class, 'create'])->name('gmail.create');
    Route::post('/change-password', [GmailController::class, 'changePassword'])->name('gmail.change_password');
    Route::post('/delete', [GmailController::class, 'delete'])->name('gmail.delete');
});

//profile
Route::group(['prefix' => 'profile'], function () {
    Route::get('/', [AdminUserController::class, 'index'])->name('admin_user.index');
    Route::get('edit', [AdminUserController::class, 'edit'])->name('admin_user.edit');
    Route::get('change-password', [AdminUserController::class, 'changePassword'])->name('admin_user.change_password');
    Route::get('logout', [AdminUserController::class, 'logout'])->name('admin_user.logout');
});

//download
Route::group(['prefix' => 'download'], function () {
    Route::get('file', [DownloadController::class, 'file'])->name('download.file');
    Route::get('hop-dong', [DownloadController::class, 'hopDong'])->name('download.hop_dong');
});

// active/unactive
Route::post('active/{tableName}', [DataController::class, 'active'])->name('admin_user.active');
Route::post('unactive/{tableName}', [DataController::class, 'unactive'])->name('admin_user.unactive');

//
Route::post('translation/{tableName}', [GoogleController::class, 'translateData'])->name('admin_user.translation');

// load data add express
Route::post('/tbl-select', [DataController::class, 'tblSelect'])->name('data.tblSelect');
Route::post('/tbl-select/save', [DataController::class, 'insertTblSelect'])->name('data.tblSelect.save');

// LOG
Route::post('log/data/{tableId}/{dataId}', [DataController::class, 'showLog'])->name('data.show_log');
Route::post('log/detail/{logId}', [DataController::class, 'showLog'])->name('data.log_detail');

Route::post('log/latest', [DataController::class, 'logLatest'])->name('data.log_latest');

// sync
Route::get('sync', [LuckyController::class, 'index'])->name('lucky');

// himalaya
Route::get('gop-khach-hang', [HimalayaController::class, 'mergeCustomer'])->name('hima.merge_customer');
Route::post('gop-khach-hang', [HimalayaController::class, 'postMergeCustomer']);
Route::get('gop-khach-hang/lich-su', [HimalayaController::class, 'mergeHistory'])->name('hima.merge_history');
// bao cao

// Route::get('hoa-don', [HimalayaController::class, 'hoaDon'])->name('hima.hoaDon');
Route::get('nhat-ky-thu-tien', [HimalayaController::class, 'phieuThu'])->name('hima.phieuThu');

//


// files
Route::group(['prefix' => 'files'], function () {
    Route::get('/', [FileController::class, 'index'])->name('file.index');
    Route::post('upload', [FileController::class, 'upload'])->name('file.upload');
    Route::get('download/{id}', [FileController::class, 'download'])->name('file.download');
    Route::post('delete', [FileController::class, 'delete'])->name('file.delete');
    Route::post('share', [FileController::class, 'share'])->name('file.share');
    Route::post('show/{type}', [FileController::class, 'show'])->name('file.show');

    Route::get('editor/all', [FileController::class, 'getAllFile'])->name('file.all');
    Route::post('editor/upload', [FileController::class, 'editorUpload'])->name('editor.upload');
});

Route::group(['prefix' => 'folder'], function () {
    Route::post('create', [FileController::class, 'createFolder'])->name('folder.create');
    Route::post('open', [FileController::class, 'openFolder'])->name('folder.open');
});

Route::get('template/{template}', function (Request $request, $template) {
    return view('mail.' . $template);
})->name(('mail.template'));

Route::group(['prefix' => 'product'], function () {
    Route::get('list', [ProductController::class, 'list'])->name('product.list');
    Route::get('create', [ProductController::class, 'createOrUpdate'])->name('product.add');
    Route::get('edit/{pid}', [ProductController::class, 'createOrUpdate'])->name('product.edit');
    Route::post('save', [ProductController::class, 'saveProduct'])->name('product.save');
    Route::post('nguyen-lieu/{pid}', [ProductController::class, 'nguyenLieu'])->name('product.nguyenLieu');

    // get sub data
    Route::post('data/info/{pid}', [ProductController::class, 'getProductInfo'])->name('product.info');

    Route::post('get-dich-vu-trong-goi/{pid}', [ProductController::class, 'dichVuTrongGoi'])->name('product.dichVuTrongGoi');
    Route::post('ap-dung/{pid}', [ProductController::class, 'apDung'])->name('product.apDung');
    Route::post('ngung-kinh-doanh', [ProductController::class, 'ngungKinhDoanh'])->name('product.ngungKinhDoanh');
    Route::post('delete-product', [ProductController::class, 'deleteProduct'])->name('product.deleteProduct');
    Route::post('search', [ProductController::class, 'search'])->name('product.search');

    // kiểm kho
    Route::get('kiem-kho', [ProductController::class, 'kiemKho'])->name('kiemKho');
    Route::post('save-kiem-kho', [ProductController::class, 'saveKiemKho'])->name('saveKiemKho');
    Route::get('in-hoa-don/kiem-kho/{id}', [ProductController::class, 'print_kiemKho'])->name('print.kiemKho');

    // khach trả hang
    Route::get('khach-tra-hang', [ProductController::class, 'khachTraHang'])->name('khachTraHang');
    Route::post('save-khach-tra-hang', [ProductController::class, 'saveKhachTraHang'])->name('saveKhachTraHang');
    Route::get('in-hoa-don/khach-tra-hang/{id}', [ProductController::class, 'print_khachTraHang'])->name('print.khachTraHang');

    // tra-hang-ncc
    Route::get('tra-hang-ncc', [ProductController::class, 'traHangNCC'])->name('traHangNCC');
    Route::post('save-tra-hang-ncc', [ProductController::class, 'saveTraHangNCC'])->name(name: 'saveTraHangNCC');
    Route::get('in-hoa-don/tra-hang-ncc/{id}', [ProductController::class, 'print_traHangNCC'])->name('print.traHangNCC');

    // nhap-hang
    Route::get('nhap-hang-report', [ProductController::class, 'nhapHangReport'])->name('nhapHangReport');
    Route::get('nhap-hang', [ProductController::class, 'nhapHang'])->name('nhapHang');
    Route::post('save-nhap-hang', [ProductController::class, 'saveNhapHang'])->name('saveNhapHang');
    Route::get('in-hoa-don/nhap-hang/{id}', [ProductController::class, 'print_nhapHang'])->name('print.nhapHang');

    // xuat-huy
    Route::get('xuat-huy', [ProductController::class, 'xuatHuy'])->name('xuatHuy');
    Route::post('save-xuat-huy', [ProductController::class, 'saveXuatHuy'])->name('saveXuatHuy');
    Route::get('in-hoa-don/xuat-huy/{id}', [ProductController::class, 'print_xuatHuy'])->name('print.xuatHuy');
});
//hima
Route::get('bao-cao/ban-hang', [ReportController::class, 'report_banHang'])->name('hima.report_phieuThu');
Route::get('bao-cao/the-dich-vu', [ReportController::class, 'report_theDichVu'])->name('hima.report_phieuChi');
Route::get('bao-cao/khach-hang', [ReportController::class, 'report_khachHang'])->name('hima.report_khachHang');
Route::get('bao-cao/hang-hoa', [ReportController::class, 'report_hangHoa'])->name('hima.report_hangHoa');

// khach hang
Route::get('khach-hang/danh-sach', [CustomerController::class, 'index'])->name('customer.index');
Route::post('khach-hang/lich-su-mua-hang/{id}', [CustomerController::class, 'lichSuMuaHang'])->name('customer.lichSuMuaHang');
Route::post('khach-hang/goi-dich-vu', [CustomerController::class, 'goiDichVu'])->name('customer.goiDichVu');
Route::post('khach-hang/the-gt', [CustomerController::class, 'cardGT'])->name('customer.cardGT');

Route::post('khach-hang/edit', [CustomerController::class, 'createOrUpdate'])->name('customer.edit');

Route::post('khach-hang/search', [CustomerController::class, 'search'])->name('customer.search');
Route::post('khach-hang/chi-tiet', [CustomerController::class, 'detail'])->name('customer.detail');

// Nhân viên
Route::get('nhan-vien/danh-sach', [NhanVienController::class, 'index'])->name('nhanVien.index');
Route::post('nhan-vien/save', [NhanVienController::class, 'saveNhanVien'])->name('nhanVien.save');
Route::post('nhan-vien/search', [NhanVienController::class, 'search'])->name('nhanVien.search');
Route::post('nhan-vien/change-password', [NhanVienController::class, 'changePW'])->name('nhanVien.changePW');
Route::post('nhan-vien/delete-user', [NhanVienController::class, 'deleteUser'])->name('nhanVien.deleteUser');

// hóa đơn
Route::get('hoa-don/danh-sach', [HoaDonController::class, 'index'])->name('hoaDon.index');
Route::post('hoa-don/hoa-don-chi-tiet', [HoaDonController::class, 'hoaDonChiTiet_byHoaDon'])->name('hoaDon.getHoaDonChiTiet');

Route::get('thu-ngan/hoa-don', [HoaDonController::class, 'createHoaDon'])->name('hoaDon.create');
// thu ngân
Route::get('thu-ngan/hoa-don-ban-le-cho-thanh-toan', [HoaDonController::class, 'hDonBanLe_choThanhToan'])->name('hoaDon.draft');
Route::post('thu-ngan/xoa-hoa-don-draft', [HoaDonController::class, 'deleteHoaDonDraft'])->name('thu_ngan.deleteHoaDonDraft');
Route::post('thu-ngan/xoa-san-pham', [HoaDonController::class, 'deletProduct'])->name('thuNgan.deletProduct');
// in hoa don
Route::get('in-hoa-don/ban-le/{id}', [HoaDonController::class, 'print_hoaDon'])->name('print.hoaDon');

// api hdon
Route::group(['prefix' => 'api'], function () {
    Route::post('hoa-don/them-hd-chi-tiet', [HoaDonController::class, 'addHoaDonChiTiet'])->name('himalaya_api.addHoaDonChiTiet');
    Route::post('hoa-don/them-goi-dv', [HoaDonController::class, 'addHoaDonChiTiet_truThe'])->name('himalaya_api.addHoaDonChiTiet_truThe');
    Route::post('hoa-don/them-sl-sp-2-hd-chi-tiet', [HoaDonController::class, 'update_SL_SP'])->name('himalaya_api.update_SL_sp');
    Route::post('hoa-don/update-customer', [HoaDonController::class, 'updateCustomer'])->name('hoa_don.update_customer');
    Route::post('hoa-don/doi-ca', [HoaDonController::class, 'caInfo'])->name('hoa_don.doiCa');

    // change nhân viên tư vấn
    Route::post('hoa-don/update-nv-tu-van', [HoaDonController::class, 'hoaDon_updateNVTuVan'])->name('himalaya_api.hoa_don.update_nvtuvan');
    Route::post('hoa-don/update-chiet-khau', [HoaDonController::class, 'hoaDon_updateCK'])->name('himalaya_api.hoa_don.hoaDon_updateCK');

    // change nhân viên thực hiện
    Route::post('hoa-don/update-nv-thuc-hien', [HoaDonController::class, 'hoaDon_updateNVThucHien'])->name('himalaya_api.hoa_don.update_nvthuchien');

    // change chiết khấu
    Route::post('hoa-don/update-phan-tram-nv-thuc-hien', [HoaDonController::class, 'hoaDon_update_percen_NVThucHien'])->name('himalaya_api.hoa_don.update_percen_NVThucHien');
    Route::post('hoa-don/update-tien-nv-thuc-hien', [HoaDonController::class, 'hoaDon_update_money_NVThucHien'])->name('himalaya_api.hoa_don.update_money_NVThucHien');
    Route::post('hoa-don/update-phan-tram-nv-tu-van', [HoaDonController::class, 'hoaDon_update_percen_NVTuVan'])->name('himalaya_api.hoa_don.update_percen_NVTuVan');
    Route::post('hoa-don/update-tien-nv-tu-van', [HoaDonController::class, 'hoaDon_update_money_NVTuVan'])->name('himalaya_api.hoa_don.update_money_NVTuVan');

    // change chi nhanh
    Route::post('hoa-don/update-chi-nhanh', [HoaDonController::class, 'hoaDon_update_chiNhanh'])->name('himalaya_api.hoa_don.update_chi_nhanh');

    Route::post('hoa-don/payment', [HoaDonController::class, 'hoaDon_payment'])->name('hoa_don.hoaDon_payment');
    Route::post('hoa-don/add', [HoaDonController::class, 'addHoaDon'])->name('hoa_don.add');
    Route::post('hoa-don/delete', [HoaDonController::class, 'deleteHoaDon'])->name('hoa_don.delete');
    Route::post('hoa-don/search', [HoaDonController::class, 'search'])->name('hoa_don.search');

    Route::post('hoa-don/huy-hoa-don/ban-le/{hoaDonId}', [HoaDonController::class, 'huyHoaDon'])->name('hoa_don.huyHoaDon.banLe');
    Route::post('hoa-don/huy-hoa-don/khach-tra-hang/{hoaDonId}', [ProductController::class, 'huyDon_KhachTraHang'])->name('hoa_don.huyHoaDon.khachTraHang');
    Route::post('hoa-don/huy-hoa-don/nhap-hang/{hoaDonId}', [ProductController::class, 'huyDon_NhapHang'])->name('hoa_don.huyHoaDon.nhapHang');
    Route::post('hoa-don/huy-hoa-don/tra-hang-nhap/{hoaDonId}', [ProductController::class, 'huyDon_TraHangNCC'])->name('hoa_don.huyHoaDon.traHangNhap');
    Route::post('hoa-don/huy-hoa-don/xuat-huy/{hoaDonId}', [ProductController::class, 'huyDon_XuatHuy'])->name('hoa_don.huyHoaDon.xuatHuy');
});

Route::group(['prefix' => 'nha-cung-cap'], function () {
    Route::get('danh-sach', [NCCController::class, 'index'])->name('ncc.index');
    Route::post('save', [NCCController::class, 'save'])->name('ncc.save');
    Route::post('detail', [NCCController::class, 'detail'])->name('ncc.detail');
});
// phiếu thu
Route::get('phieu-thu/danh-sach', [PhieuThuController::class, 'index'])->name('phieuThu.index');


Route::get('so-quy', [SoQuyController::class, 'index'])->name('soQuy');
Route::post('save-so-quy', [SoQuyController::class, 'saveSoQuy'])->name('saveSoQuy');

Route::get('cong-no', [CongNoController::class, 'index'])->name('congNo');
Route::post('save-cong-no', [CongNoController::class, 'saveCongNo'])->name('saveCongNo');
Route::post('cong-no-info', [CongNoController::class, 'info'])->name('congNoInfo');

Route::post('khach-hang/info/{id}', [KhachHangController::class, 'info'])->name('khachHang.info');

Route::post('tat-toan-cong-no', [HoaDonController::class, 'tatToanCongNo'])->name('tatToanCongNo');


Route::group(['prefix' => 'pj'], function () {
    Route::get('dashboard', [TaskController::class, 'dashboard'])->name('task.dashboard');
    Route::get('{parentName}/project/list', [ProjectController::class, 'projectList'])->name('project.list');
    Route::post('{parentName}/project/add', [ProjectController::class, 'store'])->name('project.add');
    Route::put('{parentName}/project/update/{id}', [ProjectController::class, 'updateSortOrder'])->name('project.updateSortOrder');
    Route::delete('{parentName}/project/delete/{id}', [ProjectController::class, 'destroy'])->name('project.delete');
});
//tasks
Route::group(['prefix' => 'cv'], function () {



    Route::get('{parentName}/list', [TaskController::class, 'index'])->name('task.list');
    Route::post('{parentName}/add', [TaskController::class, 'store'])->name('task.add');
    Route::put('{parentName}/update/{id}', [TaskController::class, 'updateSortOrder'])->name('task.updateSortOrder');
    Route::delete('{parentName}/delete/{id}', [TaskController::class, 'destroy'])->name('task.delete');
    Route::post('{parentName}/add-checklist', [TaskController::class, 'addChecklist'])->name('task.addChecklist');
    Route::post('{parentName}/task-info/{taskId}', [TaskController::class, 'getTaskInfo'])->name('task.getTaskInfo');
    Route::post('{parentName}/add-comment', [TaskController::class, 'addComment'])->name('task.addComment');
    Route::post('{parentName}/fast-edit', [TaskController::class, 'fastEditTask'])->name('task.fastEditTask');
    Route::post('{parentName}/sort-order', [TaskController::class, 'sortOrder'])->name('task.sortOrder');
    Route::post('{parentName}/add-express', [TaskController::class, 'addTaskExpress'])->name('task.addTaskExpress');

    Route::post('{parentName}/add-config/{currentTable}', [TaskController::class, 'addConfig'])->name('task.addConfig');
    Route::post('{parentName}/delete-config/{currentTable}', [TaskController::class, 'deleteConfig'])->name('task.deleteConfig');
});

Route::group(['prefix' => 'wms'], function () {
    Route::get('/', [ProductController::class, 'dashboard'])->name('khoHang.dashboard');
    Route::get('api/tong-quan', [ProductController::class, 'report_tongQuan'])->name('khoHang.api.tongQuan');
    Route::get('api/nhap-hang', [ProductController::class, 'report_nhapHang'])->name('khoHang.api.nhapHang');
    Route::get('api/ton-kho', [ProductController::class, 'report_tonKho'])->name('khoHang.api.tonKho'); // pending
    Route::get('api/kiem-kho', [ProductController::class, 'report_kiemKho'])->name('khoHang.api.kiemKho');
    Route::get('api/xuat-huy', [ProductController::class, 'report_xuatHuy'])->name('khoHang.api.xuatHuy'); // pending
    Route::get('api/cong-no', [ProductController::class, 'report_congNo'])->name('khoHang.api.congNo'); // pending
});

Route::group(['prefix' => 'sale'], function () {
    Route::get('/', [SalesController::class, 'dashboard'])->name('sale.dashboard');
    Route::get('report/doanh-thu', [SalesController::class, 'report_doanhThu'])->name('sale.report_doanhThu');
    Route::get('report/don-hang', [SalesController::class, 'report_DonHang'])->name('sale.report_DonHang');
    Route::get('report/khach-hang', [SalesController::class, 'report_khachHang'])->name('sale.report_khachHang');
    Route::get('report/nhan-vien-sale', [SalesController::class, 'report_nhanVienSale'])->name('sale.report_nhanVienSale');
    Route::get('report/nhan-vien-kt', [SalesController::class, 'report_nhanVienKT'])->name('sale.report_nhanVienKT');
    Route::get('report/cong-no', [SalesController::class, 'report_congNo'])->name('sale.report_congNo');
});

Route::group(['prefix' => 'tai-san'], function () {
    Route::get('/', [TaiSanController::class, 'dashboard'])->name('taiSan.dashboard');
    Route::get('danh-sach', [TaiSanController::class, 'index'])->name('taiSan.index');
    Route::post('save-tai-san', [TaiSanController::class, 'saveTaiSan'])->name('taiSan.save');
    Route::post('nhan-ban', [TaiSanController::class, 'nhanBan'])->name('taiSan.nhanBan');
    Route::post('cap-phat', [TaiSanController::class, 'capPhat'])->name('taiSan.capPhat');
});

Route::group(['prefix' => 'nhan-su'], function () {
    Route::get('/', [AdminUserController::class, 'dashboard'])->name('nhanSu.dashboard');
});

Route::group(['prefix' => 'tai-chinh'], function () {
    Route::get('/', [AdminController::class, 'dashboardTaiChinh'])->name('taiChinh.dashboard');
});

Route::group(['prefix' => 'setting'], function () {
    Route::get('/', [AdminController::class, 'dashboardSetting'])->name('setting.dashboard');
});
Route::group(['prefix' => 'report'], function () {
    Route::get('/', [ReportController::class, 'index'])->name('report.dashboard');
});


Route::group(['prefix' => 'web'], function () {
    Route::get('/', [AdminController::class, 'dashboardWeb'])->name('web.dashboard');

    Route::get('/landingpage', [LandingPageController::class, 'index'])->name('adm.landingpage.index');
    Route::get('/landingpage/setting/{menuId?}', [LandingPageController::class, 'setting'])->name('adm.landingpage.setting');
});

Route::post('/data/upload-image', [DataController::class, 'uploadImage'])->name('data.upload_image');
Route::post('/data/delete-image-tmp', [DataController::class, 'deleteImageTmp'])->name('data.delete_image_tmp');

Route::post('/data/upload-file', [DataController::class, 'uploadFile'])->name('data.upload_file');


Route::group(['prefix' => 'bds'], function () {
    Route::get('/', [AitilenController::class, 'dashboard'])->name('aitilen.dashboard');
    Route::get('report/doanh-thu', [AitilenController::class, 'report_doanhThu'])->name('aitilen.report_doanhThu');
    Route::get('report/don-hang', [AitilenController::class, 'report_DonHang'])->name('aitilen.report_DonHang');
    Route::get('report/khach-hang', [AitilenController::class, 'report_khachHang'])->name('aitilen.report_khachHang');
    Route::get('report/nhan-vien-sale', [AitilenController::class, 'report_nhanVienSale'])->name('aitilen.report_nhanVienSale');
    Route::get('report/nhan-vien-kt', [AitilenController::class, 'report_nhanVienKT'])->name('aitilen.report_nhanVienKT');
    Route::get('report/cong-no', [AitilenController::class, 'report_congNo'])->name('aitilen.report_congNo');
}); 

Route::post('get-menus', [AdminController::class, 'getMenus'])->name('getMenus');