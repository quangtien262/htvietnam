<?php

use App\Http\Controllers\Admin\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DataController;
use App\Http\Controllers\Admin\ApiController;
use App\Http\Controllers\Admin\FileController;
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
});

//tasks: api
Route::group(['prefix' => 'task'], function () {
    Route::post('sort-order', [TaskController::class, 'updateSortOrder'])->name('task.updateSortOrder');
    Route::post('fast-edit', [TaskController::class, 'fastEditTaskColumn'])->name('task.fastEditTask');

    Route::post('delete', [TaskController::class, 'destroy'])->name('task.delete');
    Route::post('info', [TaskController::class, 'getTaskInfo'])->name('task.getTaskInfo');

    Route::post('checklist/add', [TaskController::class, 'addChecklist'])->name('task.addChecklist');
    Route::post('checklist/change-status', [TaskController::class, 'changeStatusChecklist'])->name('task.changeChecklistStatus');
    Route::post('checklist/delete', [TaskController::class, 'deleteChecklist'])->name('task.deleteChecklist');

    Route::post('comment/add', [TaskController::class, 'addComment'])->name('task.addComment');
    Route::post('comment/delete', [TaskController::class, 'deleteComment'])->name('task.deleteComment');

    // list & kanban
    Route::post('list', [TaskController::class, 'listApi'])->name('api.task.list');
    Route::post('list/search', [TaskController::class, 'searchTaskList'])->name('api.task.list.search');
    Route::post('add', [TaskController::class, 'store'])->name('api.task.add');
    Route::post('add-express', [TaskController::class, 'addExpress'])->name('api.task.addTaskExpress');
    Route::post('list/search', [TaskController::class, 'searchTaskList'])->name('api.task.list.search');
    Route::post('kanban/search', [TaskController::class, 'searchTaskKanban'])->name('api.task.kanban.search');

     // add/edit status, priority
    Route::post('edit-config', [TaskController::class, 'editTableConfig'])->name('task.editConfigTask');
    Route::post('status/sort-order', [TaskController::class, 'updateSortOrder_config'])->name('task.updateSortOrder_taskStatus');
    Route::post('{parentName}/delete-config/{currentTable}', [TaskController::class, 'deleteTableConfig'])->name('task.deleteTableConfig');
});

// task
Route::group(['prefix' => 'tasks'], function () {
    Route::get('dashboard', [TaskController::class, 'dashboard'])->name('task.dashboard');

    Route::get('{parentName}/list', [TaskController::class, 'index'])->name('task.list');
    // Route::post('{parentName}/sort-order', [TaskController::class, 'sortOrder'])->name('task.sortOrder');



});
