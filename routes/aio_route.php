<?php

use App\Http\Controllers\Admin\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DataController;
use App\Http\Controllers\Admin\ApiController;
use App\Http\Controllers\Admin\FileController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TblController;


// aio/api

Route::group(['prefix' => 'menu'], function () {
    Route::post('dashboard', [AdminController::class, 'getMenusDashboard'])->name('aio.menu.dashboard');
    Route::post('submenu', [AdminController::class, 'getMenus'])->name('aio.menu.submenu');
});

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

