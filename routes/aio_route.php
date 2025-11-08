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
