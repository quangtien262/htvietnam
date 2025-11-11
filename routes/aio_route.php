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
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TblController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\SoQuyController;
use App\Http\Controllers\Admin\CommonSettingController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\NewsController;
use App\Http\Controllers\Admin\ProductsController;
use App\Http\Controllers\Admin\CongNoController;
use App\Http\Controllers\Admin\Whmcs\WhmcsClientController;
use App\Http\Controllers\Admin\Whmcs\WhmcsProductController;
use App\Http\Controllers\Admin\Whmcs\WhmcsOrderController;
use App\Http\Controllers\Admin\Whmcs\WhmcsServiceController;
use App\Http\Controllers\Admin\Whmcs\WhmcsInvoiceController;
use App\Http\Controllers\Admin\Whmcs\WhmcsDomainController;
use App\Http\Controllers\Admin\Whmcs\WhmcsTicketController;
use App\Http\Controllers\Admin\Whmcs\WhmcsPaymentController;
use App\Http\Controllers\Admin\Whmcs\WhmcsReportController;
use App\Http\Controllers\Admin\Whmcs\WhmcsSettingController;
use App\Http\Controllers\Admin\Whmcs\WhmcsServerController;
use App\Http\Controllers\Admin\Whmcs\WhmcsHostingProductController;

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
    Route::post('sort-order', [TaskController::class, 'updateSortOrder'])->name('aio.task.updateSortOrder');
    Route::post('fast-edit', [TaskController::class, 'fastEditTaskColumn'])->name('aio.task.fastEditTask');

    Route::post('delete', [TaskController::class, 'destroy'])->name('aio.task.delete');
    Route::post('info', [TaskController::class, 'getTaskInfo'])->name('aio.task.getTaskInfo');

    Route::post('checklist/add', [TaskController::class, 'addChecklist'])->name('aio.task.addChecklist');
    Route::post('checklist/change-status', [TaskController::class, 'changeStatusChecklist'])->name('aio.task.changeChecklistStatus');
    Route::post('checklist/delete', [TaskController::class, 'deleteChecklist'])->name('aio.task.deleteChecklist');

    Route::post('comment/add', [TaskController::class, 'addComment'])->name('aio.task.addComment');
    Route::post('comment/delete', [TaskController::class, 'deleteComment'])->name('aio.task.deleteComment');

    // list & kanban
    Route::post('list', [TaskController::class, 'listApi'])->name('aio.task.list');
    Route::post('list/search', [TaskController::class, 'searchTaskList'])->name('aio.task.list.search');
    Route::post('add', [TaskController::class, 'store'])->name('aio.task.add');
    Route::post('add-express', [TaskController::class, 'addExpress'])->name('aio.task.addTaskExpress');
    Route::post('list/search', [TaskController::class, 'searchTaskList'])->name('aio.task.list.search');
    Route::post('kanban/search', [TaskController::class, 'searchTaskKanban'])->name('aio.task.kanban.search');

    // add/edit status, priority
    Route::post('edit-config', [TaskController::class, 'editTableConfig'])->name('aio.task.editConfigTask');
    Route::post('status/sort-order', [TaskController::class, 'updateSortOrder_config'])->name('aio.task.updateSortOrder_taskStatus');
    Route::post('{parentName}/delete-config/{currentTable}', [TaskController::class, 'deleteTableConfig'])->name('aio.task.deleteTableConfig');
});

// task
Route::group(['prefix' => 'tasks'], function () {
    Route::get('dashboard', [TaskController::class, 'dashboard'])->name('aio.task.dashboard');

    Route::get('{parentName}/list', [TaskController::class, 'index'])->name('aio.task.list');
    // Route::post('{parentName}/sort-order', [TaskController::class, 'sortOrder'])->name('aio.task.sortOrder');
});

// project: api
Route::group(['prefix' => 'project'], function () {
    Route::put('update-sort-order/{id}', [ProjectController::class, 'updateSortOrder'])->name('project.updateSortOrder');
    Route::post('sort-order/project-status', [ProjectController::class, 'updateSortOrderStatus'])->name('project.updateSortOrderStatus');

    Route::post('add-checklist', [ProjectController::class, 'addChecklist'])->name('project.addChecklist');
    Route::post('add-comment', [ProjectController::class, 'addComment'])->name('project.addComment');
    Route::post('info', [ProjectController::class, 'getProjectInfo'])->name('project.getProjectInfo');

    // OK
    Route::post('list', [ProjectController::class, 'indexApi'])->name('project.list');
    Route::post('fast-edit', [ProjectController::class, 'fastEditProject'])->name('project.fastEditProject');
    Route::post('search', [ProjectController::class, 'search'])->name('project.search');
    Route::post('edit-config', [ProjectController::class, 'editConfig'])->name('project.editConfig');
    Route::post('add', [ProjectController::class, 'store'])->name('project.add');
    Route::post('delete', [ProjectController::class, 'destroy'])->name('project.delete');
    Route::post('comment/delete', [ProjectController::class, 'deleteComment'])->name('project.deleteComment');
});

Route::group(['prefix' => 'pj'], function () {
    Route::get('{parentName}/list', [ProjectController::class, 'index'])->name('project.list');

    // Route::put('{parentName}/update/{id}', [ProjectController::class, 'updateSortOrder'])->name('project.updateSortOrder');
    // Route::delete('{parentName}/delete/{id}', [ProjectController::class, 'destroy'])->name('project.delete');
    // Route::post('{parentName}/add-checklist', [TaskController::class, 'addChecklist'])->name('project.addChecklist');

    // Route::post('{parentName}/add-comment', [TaskController::class, 'addComment'])->name('project.addComment');
    Route::post('{parentName}/sort-order', [TaskController::class, 'sortOrder'])->name('project.sortOrder');
    Route::post('{parentName}/add-express', [ProjectController::class, 'addExpress'])->name('project.addExpress');


    Route::post('{parentName}/delete-config/{currentTable}', [ProjectController::class, 'deleteConfig'])->name('project.deleteConfig');
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
    Route::post('fast-  ', [CustomerController::class, 'fastEdit'])->name('customer.fastEdit');
    Route::post('edit', [CustomerController::class, 'createOrUpdate'])->name('customer.edit');
    Route::post('search', [CustomerController::class, 'search'])->name('customer.search');
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

// WHMCS Routes
Route::group(['prefix' => 'whmcs'], function () {

    // Clients
    Route::group(['prefix' => 'clients'], function () {
        Route::post('list', [WhmcsClientController::class, 'apiList'])->name('api.whmcs.clients.list');
        Route::post('detail/{id}', [WhmcsClientController::class, 'apiDetail'])->name('api.whmcs.clients.detail');
        Route::post('add', [WhmcsClientController::class, 'apiAdd'])->name('api.whmcs.clients.add');
        Route::post('update/{id}', [WhmcsClientController::class, 'apiUpdate'])->name('api.whmcs.clients.update');
        Route::post('delete/{id}', [WhmcsClientController::class, 'apiDelete'])->name('api.whmcs.clients.delete');
        Route::post('statistics', [WhmcsClientController::class, 'apiStatistics'])->name('api.whmcs.clients.statistics');
    });

    // Products
    Route::group(['prefix' => 'products'], function () {
        Route::post('list', [WhmcsProductController::class, 'apiList'])->name('api.whmcs.products.list');
        Route::post('detail/{id}', [WhmcsProductController::class, 'apiDetail'])->name('api.whmcs.products.detail');
        Route::post('add', [WhmcsProductController::class, 'apiAdd'])->name('api.whmcs.products.add');
        Route::post('update/{id}', [WhmcsProductController::class, 'apiUpdate'])->name('api.whmcs.products.update');
        Route::post('delete/{id}', [WhmcsProductController::class, 'apiDelete'])->name('api.whmcs.products.delete');
        Route::post('groups', [WhmcsProductController::class, 'apiGroups'])->name('api.whmcs.products.groups');
    });

    // Orders
    Route::group(['prefix' => 'orders'], function () {
        Route::post('list', [WhmcsOrderController::class, 'apiList'])->name('api.whmcs.orders.list');
        Route::post('detail/{id}', [WhmcsOrderController::class, 'apiDetail'])->name('api.whmcs.orders.detail');
        Route::post('add', [WhmcsOrderController::class, 'apiAdd'])->name('api.whmcs.orders.add');
        Route::post('update-status/{id}', [WhmcsOrderController::class, 'apiUpdateStatus'])->name('api.whmcs.orders.updateStatus');
        Route::post('delete/{id}', [WhmcsOrderController::class, 'apiDelete'])->name('api.whmcs.orders.delete');
    });

    // Services
    Route::group(['prefix' => 'services'], function () {
        Route::post('list', [WhmcsServiceController::class, 'apiList'])->name('api.whmcs.services.list');
        Route::post('detail/{id}', [WhmcsServiceController::class, 'apiDetail'])->name('api.whmcs.services.detail');
        Route::post('suspend/{id}', [WhmcsServiceController::class, 'apiSuspend'])->name('api.whmcs.services.suspend');
        Route::post('unsuspend/{id}', [WhmcsServiceController::class, 'apiUnsuspend'])->name('api.whmcs.services.unsuspend');
        Route::post('terminate/{id}', [WhmcsServiceController::class, 'apiTerminate'])->name('api.whmcs.services.terminate');
        Route::post('statistics', [WhmcsServiceController::class, 'apiStatistics'])->name('api.whmcs.services.statistics');
    });

    // Invoices
    Route::group(['prefix' => 'invoices'], function () {
        Route::post('list', [WhmcsInvoiceController::class, 'apiList'])->name('api.whmcs.invoices.list');
        Route::post('detail/{id}', [WhmcsInvoiceController::class, 'apiDetail'])->name('api.whmcs.invoices.detail');
        Route::post('add', [WhmcsInvoiceController::class, 'apiAdd'])->name('api.whmcs.invoices.add');
        Route::post('update/{id}', [WhmcsInvoiceController::class, 'apiUpdate'])->name('api.whmcs.invoices.update');
        Route::post('mark-paid/{id}', [WhmcsInvoiceController::class, 'apiMarkPaid'])->name('api.whmcs.invoices.markPaid');
        Route::post('delete/{id}', [WhmcsInvoiceController::class, 'apiDelete'])->name('api.whmcs.invoices.delete');
        Route::post('statistics', [WhmcsInvoiceController::class, 'apiStatistics'])->name('api.whmcs.invoices.statistics');
    });

    // Domains
    Route::group(['prefix' => 'domains'], function () {
        Route::post('list', [WhmcsDomainController::class, 'apiList'])->name('api.whmcs.domains.list');
        Route::post('detail/{id}', [WhmcsDomainController::class, 'apiDetail'])->name('api.whmcs.domains.detail');
        Route::post('add', [WhmcsDomainController::class, 'apiAdd'])->name('api.whmcs.domains.add');
        Route::post('update/{id}', [WhmcsDomainController::class, 'apiUpdate'])->name('api.whmcs.domains.update');
        Route::post('renew/{id}', [WhmcsDomainController::class, 'apiRenew'])->name('api.whmcs.domains.renew');
        Route::post('tlds', [WhmcsDomainController::class, 'apiTlds'])->name('api.whmcs.domains.tlds');
    });

    // Tickets
    Route::group(['prefix' => 'tickets'], function () {
        Route::post('list', [WhmcsTicketController::class, 'apiList'])->name('api.whmcs.tickets.list');
        Route::post('detail/{id}', [WhmcsTicketController::class, 'apiDetail'])->name('api.whmcs.tickets.detail');
        Route::post('add', [WhmcsTicketController::class, 'apiAdd'])->name('api.whmcs.tickets.add');
        Route::post('reply/{id}', [WhmcsTicketController::class, 'apiReply'])->name('api.whmcs.tickets.reply');
        Route::post('close/{id}', [WhmcsTicketController::class, 'apiClose'])->name('api.whmcs.tickets.close');
        Route::post('departments', [WhmcsTicketController::class, 'apiDepartments'])->name('api.whmcs.tickets.departments');
    });

    // Payments
    Route::group(['prefix' => 'payments'], function () {
        Route::post('transactions', [WhmcsPaymentController::class, 'apiTransactions'])->name('api.whmcs.payments.transactions');
        Route::post('gateways', [WhmcsPaymentController::class, 'apiGateways'])->name('api.whmcs.payments.gateways');
        Route::post('add-payment', [WhmcsPaymentController::class, 'apiAddPayment'])->name('api.whmcs.payments.addPayment');
    });

    // Reports
    Route::group(['prefix' => 'reports'], function () {
        Route::post('dashboard', [WhmcsReportController::class, 'apiDashboard'])->name('api.whmcs.reports.dashboard');
        Route::post('revenue', [WhmcsReportController::class, 'apiRevenue'])->name('api.whmcs.reports.revenue');
        Route::post('clients-growth', [WhmcsReportController::class, 'apiClientsGrowth'])->name('api.whmcs.reports.clientsGrowth');
        Route::post('services-statistics', [WhmcsReportController::class, 'apiServicesStatistics'])->name('api.whmcs.reports.servicesStatistics');
    });

    // Settings
    Route::group(['prefix' => 'settings'], function () {
        Route::post('currencies', [WhmcsSettingController::class, 'apiCurrencies'])->name('api.whmcs.settings.currencies');
        Route::post('tax-rules', [WhmcsSettingController::class, 'apiTaxRules'])->name('api.whmcs.settings.taxRules');
        Route::post('promo-codes', [WhmcsSettingController::class, 'apiPromoCodes'])->name('api.whmcs.settings.promoCodes');
    });

    // Servers
    Route::group(['prefix' => 'servers'], function () {
        Route::post('list', [WhmcsServerController::class, 'apiList'])->name('api.whmcs.servers.list');
        Route::post('detail/{id}', [WhmcsServerController::class, 'apiDetail'])->name('api.whmcs.servers.detail');
        Route::post('add', [WhmcsServerController::class, 'apiAdd'])->name('api.whmcs.servers.add');
        Route::post('update/{id}', [WhmcsServerController::class, 'apiUpdate'])->name('api.whmcs.servers.update');
        Route::post('delete/{id}', [WhmcsServerController::class, 'apiDelete'])->name('api.whmcs.servers.delete');
        Route::post('test-connection/{id}', [WhmcsServerController::class, 'apiTestConnection'])->name('api.whmcs.servers.testConnection');
    });

    // Hosting Products
    Route::group(['prefix' => 'hosting-products'], function () {
        Route::post('list', [WhmcsHostingProductController::class, 'apiList'])->name('api.whmcs.hostingProducts.list');
        Route::post('detail/{id}', [WhmcsHostingProductController::class, 'apiDetail'])->name('api.whmcs.hostingProducts.detail');
        Route::post('add', [WhmcsHostingProductController::class, 'apiAdd'])->name('api.whmcs.hostingProducts.add');
        Route::post('update/{id}', [WhmcsHostingProductController::class, 'apiUpdate'])->name('api.whmcs.hostingProducts.update');
        Route::post('delete/{id}', [WhmcsHostingProductController::class, 'apiDelete'])->name('api.whmcs.hostingProducts.delete');
    });
});
