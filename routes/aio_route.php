<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AitilenController;
use App\Http\Controllers\Admin\AitilenInvoiceController;
use App\Http\Controllers\Admin\AitilenReportController;
use App\Http\Controllers\Admin\CustomerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DataController;
use App\Http\Controllers\Admin\ApiController;
use App\Http\Controllers\Admin\ContractController;
use App\Http\Controllers\Admin\FileController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\MeetingController;
use App\Http\Controllers\Admin\ProController;
use App\Http\Controllers\Admin\SubProController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TblController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\SoQuyController;
use App\Http\Controllers\Admin\CommonSettingController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\NewsController;
use App\Http\Controllers\Admin\ProductsController;
use App\Http\Controllers\Admin\CongNoController;
use App\Http\Controllers\Aitilen\AitilenDauTuController;

// SPA Module Controllers
use App\Http\Controllers\Admin\Spa\ChiNhanhController;
use App\Http\Controllers\Admin\Spa\CaLamViecController;
use App\Http\Controllers\Admin\Spa\DichVuController;
use App\Http\Controllers\Admin\Spa\DanhMucDichVuController;
use App\Http\Controllers\Admin\Spa\GoiDichVuController;
use App\Http\Controllers\Admin\Spa\SanPhamController;
use App\Http\Controllers\Admin\Spa\DanhMucSanPhamController;
use App\Http\Controllers\Admin\Spa\POSController;

// aio/api
Route::post('customer/login', [AuthController::class, 'loginExpress'])->name('aio.customer.loginExpress');

Route::group(['prefix' => 'menu'], function () {
    Route::post('dashboard', [AdminController::class, 'getMenusDashboard'])->name('aio.menu.dashboard');
    Route::post('submenu', [AdminController::class, 'getMenus'])->name('aio.menu.submenu');
});

// data
Route::group(['prefix' => 'data'], function () {
    Route::post('delete', [DataController::class, 'delete'])->name('aio.data.delete');
    Route::post('deletes', [DataController::class, 'deleteDatas'])->name('aio.data.deletes');
    Route::post('add', [DataController::class, 'add'])->name('aio.data.add');
    Route::post('update', [DataController::class, 'update'])->name('aio.data.update');
    Route::post('fast-edit', [DataController::class, 'fastEdit02'])->name('aio.data.fastEdit');

    Route::post('data-select', [DataController::class, 'dataSelect'])->name('aio.dataSelect');
    Route::post('data-key', [DataController::class, 'getDataKeyValue'])->name('aio.getDataKeyValue');

    // sửa nhanh theo "id bảng", tên cột cần sửa và id của bảng
    Route::post('fast-edit/{tableId}', [DataController::class, 'fastEdit'])->name('data.fastEdit');
    // sửa nhanh theo "tên bảng," tên cột cần sửa và id của bảng
    Route::post('fast-edit', [DataController::class, 'fastEditByTableName'])->name('data.fastEditByTableName');

    Route::post('update-sort-order', [DataController::class, 'updateSortOrder02'])->name('data.sortOrder02');

    // upload
    Route::post('upload-image', [DataController::class, 'uploadImage'])->name('data.upload_image');
    Route::post('delete-image-tmp', [DataController::class, 'deleteImageTmp'])->name('data.delete_image_tmp');

    Route::post('upload-file', [DataController::class, 'uploadFile'])->name('data.upload_file');
});

//tasks: api
Route::group(['prefix' => 'task'], function () {
    Route::post('sort-order', [SubProController::class, 'updateSortOrder'])->name('aio.task.updateSortOrder');
    Route::post('fast-edit', [SubProController::class, 'fastEditTaskColumn'])->name('aio.task.fastEditTask');

    Route::post('delete', [SubProController::class, 'destroy'])->name('aio.task.delete');
    Route::post('info', [SubProController::class, 'getTaskInfo'])->name('aio.task.getTaskInfo');

    Route::post('checklist/add', [SubProController::class, 'addChecklist'])->name('aio.task.addChecklist');
    Route::post('checklist/change-status', [SubProController::class, 'changeStatusChecklist'])->name('aio.task.changeChecklistStatus');
    Route::post('checklist/delete', [SubProController::class, 'deleteChecklist'])->name('aio.task.deleteChecklist');

    Route::post('comment/add', [SubProController::class, 'addComment'])->name('aio.task.addComment');
    Route::post('comment/delete', [SubProController::class, 'deleteComment'])->name('aio.task.deleteComment');

    // list & kanban
    Route::post('list', [SubProController::class, 'listApi'])->name('aio.task.list');
    Route::post('list/search', [SubProController::class, 'searchTaskList'])->name('aio.task.list.search');
    Route::post('add', [SubProController::class, 'store'])->name('aio.task.add');
    Route::post('add-express', [SubProController::class, 'addExpress'])->name('aio.task.addTaskExpress');
    Route::post('list/search', [SubProController::class, 'searchTaskList'])->name('aio.task.list.search');
    Route::post('kanban/search', [SubProController::class, 'searchTaskKanban'])->name('aio.task.kanban.search');

    // add/edit status, priority
    Route::post('edit-config', [SubProController::class, 'editTableConfig'])->name('aio.task.editConfigTask');
    Route::post('status/sort-order', [SubProController::class, 'updateSortOrder_config'])->name('aio.task.updateSortOrder_taskStatus');
    Route::post('{parentName}/delete-config/{currentTable}', [SubProController::class, 'deleteTableConfig'])->name('aio.task.deleteTableConfig');
});

// task
Route::group(['prefix' => 'tasks'], function () {
    Route::get('dashboard', [SubProController::class, 'dashboard'])->name('aio.task.dashboard');

    Route::get('{parentName}/list', [SubProController::class, 'index'])->name('aio.task.list');
    Route::post('{parentName}/sort-order', [SubProController::class, 'sortOrder'])->name('project.sortOrder');
    // Route::post('{parentName}/sort-order', [SubProController::class, 'sortOrder'])->name('aio.task.sortOrder');
});

// project: api
Route::group(['prefix' => 'project'], function () {
    Route::put('update-sort-order/{id}', [ProController::class, 'updateSortOrder'])->name('project.updateSortOrder');
    Route::post('sort-order/project-status', [ProController::class, 'updateSortOrderStatus'])->name('project.updateSortOrderStatus');

    Route::post('add-checklist', [ProController::class, 'addChecklist'])->name('project.addChecklist');
    Route::post('add-comment', [ProController::class, 'addComment'])->name('project.addComment');
    Route::post('info', [ProController::class, 'getProjectInfo'])->name('project.getProjectInfo');

    // OK
    Route::post('list', [ProController::class, 'indexApi'])->name('project.list');
    Route::post('fast-edit', [ProController::class, 'fastEditProject'])->name('project.fastEditProject');
    Route::post('search', [ProController::class, 'search'])->name('project.search');
    Route::post('edit-config', [ProController::class, 'editConfig'])->name('project.editConfig');
    Route::post('add', [ProController::class, 'store'])->name('project.add');
    Route::post('delete', [ProController::class, 'destroy'])->name('project.delete');
    Route::post('comment/delete', [ProController::class, 'deleteComment'])->name('project.deleteComment');
});

Route::group(['prefix' => 'pj'], function () {
    Route::get('{parentName}/list', [ProController::class, 'index'])->name('project.list');
    Route::post('{parentName}/add-express', [ProController::class, 'addExpress'])->name('project.addExpress');


    Route::post('{parentName}/delete-config/{currentTable}', [ProController::class, 'deleteConfig'])->name('project.deleteConfig');
});

// invoice: api
Route::group(['prefix' => 'invoice'], function () {
    // Route::post('index-api/bds', [InvoiceController::class, 'indexApi'])->name('invoice.indexApi');
    // Route::post('search/bds', [InvoiceController::class, 'searchApi'])->name('invoice.searchApi');
    // Route::post('update', [InvoiceController::class, 'updateInvoice'])->name('invoice.update');
    // Route::post('change-status', [InvoiceController::class, 'changeInvoiceStatus'])->name('invoice.changeStatus');
    // Route::post('delete', [InvoiceController::class, 'deleteInvoice'])->name('invoice.delete');

});

// Aitilen business
Route::group(['prefix' => 'aitilen'], function () {
    Route::post('service/dien-nuoc', [AitilenController::class, 'dienNuoc'])->name('aitilen.service.dienNuoc');
    Route::post('service/save-dien-nuoc', [AitilenController::class, 'saveDienNuoc'])->name('aitilen.service.saveDienNuoc');
    Route::post('service/fast-edit-dien-nuoc', [AitilenController::class, 'fastEditDienNuoc'])->name('aitilen.service.fastEditDienNuoc');
    Route::post('service/delete-dien-nuoc', [AitilenController::class, 'deleteDienNuoc'])->name('aitilen.service.deleteDienNuoc');
    Route::post('service/search-dien-nuoc', [AitilenController::class, 'searchDienNuoc'])->name('aitilen.service.dienNuocSearch');
    Route::post('service/create-data-dien-nuoc-thang', [AitilenController::class, 'createDataDienNuocThang'])->name('aitilen.service.createDataDienNuocThang');

     // dau tu (investment costs)
    Route::post('dau-tu/list', [AitilenDauTuController::class, 'list'])->name('aitilen.dauTu.list');
    Route::post('dau-tu/add', [AitilenDauTuController::class, 'add'])->name('aitilen.dauTu.add');
    Route::post('dau-tu/add-bulk', [AitilenDauTuController::class, 'addBulk'])->name('aitilen.dauTu.addBulk');
    Route::post('dau-tu/update', [AitilenDauTuController::class, 'update'])->name('aitilen.dauTu.update');
    Route::post('dau-tu/delete', [AitilenDauTuController::class, 'delete'])->name('aitilen.dauTu.delete');
    Route::post('dau-tu/update-sort-order', [AitilenDauTuController::class, 'updateSortOrder'])->name('aitilen.dauTu.updateSortOrder');
    Route::post('dau-tu/select-data', [AitilenDauTuController::class, 'selectData'])->name('aitilen.dauTu.selectData');
    Route::post('dau-tu/report', [AitilenDauTuController::class, 'report'])->name('aitilen.dauTu.report');


    // apartment
    Route::post('apartment/list', [AitilenController::class, 'apartmentList'])->name('aitilen.apartment.list');
    Route::post('apartment/save', [AitilenController::class, 'saveApartment'])->name('aitilen.apartment.save');
    Route::post('apartment/delete', [AitilenController::class, 'deleteApartment'])->name('aitilen.apartment.delete');
    Route::post('apartment/fast-edit', [AitilenController::class, 'fastEditApartment'])->name('aitilen.apartment.fastEdit');
    Route::post('apartment/detail', [AitilenController::class, 'getApartmentDetail'])->name('aitilen.apartment.detail');
    Route::post('apartment/rooms', [AitilenController::class, 'getApartmentRooms'])->name('aitilen.apartment.rooms');

    // room
    Route::post('room/save', [AitilenController::class, 'saveRoom'])->name('aitilen.room.save');
    Route::post('room/delete', [AitilenController::class, 'deleteRoom'])->name('aitilen.room.delete');

    // tự đông tạo hóa đơn theo tháng chỉ định
    Route::post('invoice/create-invoice-by-month', [AitilenController::class, 'createInvoiceMonth'])->name('aitilen.service.createInvoiceMonth');
    // tính lại tiền cho hóa đơn được chỉ định
    Route::post('invoice/recalculate-invoice', [AitilenController::class, 'recalculateInvoiceByRooms'])->name('aitilen.service.recalculateInvoiceByRooms');

    // invoice
    Route::post('invoice/index-api/bds', [AitilenInvoiceController::class, 'indexApi_bds'])->name('bds.invoice.indexApi');
    Route::post('invoice/search/bds', [AitilenInvoiceController::class, 'searchApi_bds'])->name('bds.invoice.searchApi');
    Route::post('invoice/update', [AitilenInvoiceController::class, 'updateInvoice'])->name('aio.invoice.update');
    Route::post('invoice/change-status', [AitilenInvoiceController::class, 'changeInvoiceStatus'])->name('aio.invoice.changeStatus');
    Route::post('invoice/delete', [AitilenInvoiceController::class, 'deleteInvoice'])->name('aio.invoice.delete');
    Route::post('invoice/active-current', [AitilenInvoiceController::class, 'activeCurrentInvoice'])->name('aio.invoice.activeCurrent');
    Route::post('invoice/active-all', [AitilenInvoiceController::class, 'activeAllInvoice'])->name('aio.invoice.activeAll');
    Route::post('invoice/statistics', [AitilenInvoiceController::class, 'getInvoiceStatistics'])->name('aio.invoice.statistics');
    Route::post('invoice/statistics-by-apartment', [AitilenInvoiceController::class, 'getInvoiceStatisticsByApartment'])->name('aio.invoice.statisticsByApartment');
    Route::post('invoice/by-service', [AitilenInvoiceController::class, 'getInvoicesByService'])->name('aio.invoice.byService');

    // report
    Route::post('report/tong-loi-nhuan', [AitilenReportController::class, 'tongLoiNhuan'])->name('aio.invoice.tongLoiNhuan');
    Route::post('report/loi-nhuan-theo-tien-phong', [AitilenReportController::class, 'loiNhuanTheoTienPhong'])->name('aio.invoice.loiNhuanTheoTienPhong');
    Route::post('report/loi-nhuan-theo-dich-vu', [AitilenReportController::class, 'loiNhuanTheoDichVu'])->name('aio.invoice.loiNhuanTheoDichVu');
    Route::post('report/bao-cao-thu-chi', [AitilenReportController::class, 'baoCaoThuChi'])->name('aio.invoice.baoCaoThuChi');
    Route::post('report/bao-cao-cong-no', [AitilenReportController::class, 'baoCaoCongNo'])->name('aio.invoice.baoCaoCongNo');
    Route::post('report/bao-cao-tai-san', [AitilenReportController::class, 'baoCaoTaiSan'])->name('aio.invoice.baoCaoTaiSan');

    // so quy
    Route::post('so-quy/list', [SoQuyController::class, 'apiList'])->name('aitilen.soQuy.list');
    Route::post('so-quy/add', [SoQuyController::class, 'apiAdd'])->name('aitilen.soQuy.add');
    Route::post('so-quy/update', [SoQuyController::class, 'apiUpdate'])->name('aitilen.soQuy.update');
    Route::post('so-quy/delete', [SoQuyController::class, 'apiDelete'])->name('aitilen.soQuy.delete');

    // master data for so quy
    Route::post('so-quy-type/list', [SoQuyController::class, 'getSoQuyTypes'])->name('aitilen.soQuyType.list');
    Route::post('so-quy-status/list', [SoQuyController::class, 'getSoQuyStatuses'])->name('aitilen.soQuyStatus.list');
    Route::post('loai-thu/list', [SoQuyController::class, 'getLoaiThu'])->name('aitilen.loaiThu.list');
    Route::post('loai-chi/list', [SoQuyController::class, 'getLoaiChi'])->name('aitilen.loaiChi.list');
    Route::post('chi-nhanh/list', [SoQuyController::class, 'getChiNhanh'])->name('aitilen.chiNhanh.list');
    Route::post('admin-users/list', [SoQuyController::class, 'getAdminUsers'])->name('aitilen.adminUsers.list');
});

// contact: api
Route::group(['prefix' => 'contract'], function () {
    Route::post('info', [ContractController::class, 'info'])->name('contract.info');
    Route::post('index-api/bds', [ContractController::class, 'indexBds'])->name('contract.index');
    Route::post('update', [ContractController::class, 'update'])->name('contract.update');
    Route::post('fast-edit', [ContractController::class, 'fastEdit'])->name('contract.fastEdit');
    Route::post('search', [ContractController::class, 'search'])->name('contract.search');
    Route::post('delete', [ContractController::class, 'delete'])->name('contract.delete');
    Route::post('statistics', [ContractController::class, 'getContractStatistics'])->name('contract.statistics');
    Route::post('statistics-by-apartment', [ContractController::class, 'getContractStatisticsByApartment'])->name('contract.statisticsByApartment');
    Route::post('by-service', [ContractController::class, 'getContractsByService'])->name('contract.byService');
});

// customer: api
Route::group(['prefix' => 'customer'], function () {
    Route::post('index-api', [CustomerController::class, 'indexApi'])->name('customer.index');
    Route::post('search', [CustomerController::class, 'search'])->name('customer.search');
    Route::post('detail', [CustomerController::class, 'detail'])->name('customer.detail');
    Route::post('update', [CustomerController::class, 'update'])->name('customer.update');
    Route::post('fast-edit', [CustomerController::class, 'fastEdit'])->name('customer.fastEdit');
    Route::post('edit', [CustomerController::class, 'createOrUpdate'])->name('customer.edit');
    Route::post('add', [CustomerController::class, 'createOrUpdate'])->name('customer.add');
});

Route::group(['prefix' => 'meeting'], function () {
    Route::post('index-api', [MeetingController::class, 'fetchIndexData'])->name('meeting.fetchIndexData');
    Route::post('add-express', [MeetingController::class, 'addExpress'])->name('meeting.addExpress');
    Route::post('delete', [MeetingController::class, 'deleteMeeting'])->name('meeting.delete');
    Route::post('close', [MeetingController::class, 'closeMeeting'])->name('meeting.close');
    Route::post('update', [MeetingController::class, 'updateMeeting'])->name('meeting.updateMeeting');
    Route::post('search', [MeetingController::class, 'search'])->name('meeting.search');
});


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

// Common Settings - Dynamic routes for all setting tables
Route::group(['prefix' => 'setting'], function () {
    Route::post('{tableName}/list', [CommonSettingController::class, 'apiList'])->name('setting.list');
    Route::post('{tableName}/add', [CommonSettingController::class, 'apiAdd'])->name('setting.add');
    Route::post('{tableName}/update', [CommonSettingController::class, 'apiUpdate'])->name('setting.update');
    Route::post('{tableName}/delete', [CommonSettingController::class, 'apiDelete'])->name('setting.delete');
    Route::post('{tableName}/update-sort-order', [CommonSettingController::class, 'apiUpdateSortOrder'])->name('setting.updateSortOrder');
});

// Menu Management - Multilanguage
Route::group(['prefix' => 'menu'], function () {
    Route::post('list', [MenuController::class, 'apiList'])->name('menu.list');
    Route::post('detail', [MenuController::class, 'apiDetail'])->name('menu.detail');
    Route::post('add', [MenuController::class, 'apiAdd'])->name('menu.add');
    Route::post('update', [MenuController::class, 'apiUpdate'])->name('menu.update');
    Route::post('delete', [MenuController::class, 'apiDelete'])->name('menu.delete');
    Route::post('update-sort-order', [MenuController::class, 'apiUpdateSortOrder'])->name('menu.updateSortOrder');
    Route::post('languages', [MenuController::class, 'getLanguages'])->name('menu.languages');
});

// News Management - Multilanguage
Route::group(['prefix' => 'news'], function () {
    Route::post('list', [NewsController::class, 'apiList'])->name('news.list');
    Route::post('detail', [NewsController::class, 'apiDetail'])->name('news.detail');
    Route::post('add', [NewsController::class, 'apiAdd'])->name('news.add');
    Route::post('update', [NewsController::class, 'apiUpdate'])->name('news.update');
    Route::post('delete', [NewsController::class, 'apiDelete'])->name('news.delete');
    Route::post('languages', [NewsController::class, 'getLanguages'])->name('news.languages');
});

// Products Management - Multilanguage
Route::group(['prefix' => 'products'], function () {
    Route::post('list', [ProductsController::class, 'apiList'])->name('products.list');
    Route::post('detail', [ProductsController::class, 'apiDetail'])->name('products.detail');
    Route::post('add', [ProductsController::class, 'apiAdd'])->name('products.add');
    Route::post('update', [ProductsController::class, 'apiUpdate'])->name('products.update');
    Route::post('delete', [ProductsController::class, 'apiDelete'])->name('products.delete');
    Route::post('languages', [ProductsController::class, 'getLanguages'])->name('products.languages');
});

// CongNo (Debt) Management
Route::group(['prefix' => 'cong-no'], function () {
    Route::post('list', [CongNoController::class, 'apiList'])->name('api.congNo.list');
    Route::post('detail', [CongNoController::class, 'apiDetail'])->name('api.congNo.detail');
    Route::post('add', [CongNoController::class, 'apiAdd'])->name('api.congNo.add');
    Route::post('update', [CongNoController::class, 'apiUpdate'])->name('api.congNo.update');
    Route::post('delete', [CongNoController::class, 'apiDelete'])->name('api.congNo.delete');
    Route::post('nha-cung-cap', [CongNoController::class, 'apiNhaCungCapList'])->name('api.congNo.nhaCungCap');
    Route::post('users', [CongNoController::class, 'apiUsersList'])->name('api.congNo.users');
    Route::post('status', [CongNoController::class, 'apiStatusList'])->name('api.congNo.status');

    // Advanced CRUD features
    Route::post('payment', [CongNoController::class, 'apiPayment'])->name('api.congNo.payment');
    Route::post('payment-history', [CongNoController::class, 'apiPaymentHistory'])->name('api.congNo.paymentHistory');
    Route::post('statistics', [CongNoController::class, 'apiStatistics'])->name('api.congNo.statistics');
    Route::post('bulk-update-status', [CongNoController::class, 'apiBulkUpdateStatus'])->name('api.congNo.bulkUpdateStatus');
    Route::post('export', [CongNoController::class, 'apiExport'])->name('api.congNo.export');
});

Route::group(['prefix' => 'user'], function () {
    Route::post('select-data', [CustomerController::class, 'apiSelectData'])->name('api.user.selectData');
    Route::get('list', [CustomerController::class, 'indexApi'])->name('api.user.list');
    Route::get('{id}', [CustomerController::class, 'detail'])->name('api.user.detail');
    Route::post('add', [CustomerController::class, 'createOrUpdate'])->name('api.user.add');
});

// ============================
// SPA MODULE API ROUTES
// ============================
Route::group(['prefix' => 'admin/spa'], function () {
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
});
