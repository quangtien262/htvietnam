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

//tasks: api
Route::group(['prefix' => 'task'], function () {
    Route::post('api/sort-order/task-status', [TaskController::class, 'updateSortOrder_taskStatus'])->name('task.updateSortOrder_taskStatus');
    Route::put('update-sort-order/{id}', [TaskController::class, 'updateSortOrder'])->name('task.updateSortOrder');
    Route::post('fast-edit', [TaskController::class, 'fastEditTask'])->name('task.fastEditTask');

    Route::post('delete/{id}', [TaskController::class, 'destroy'])->name('task.delete');
    Route::post('add-checklist', [TaskController::class, 'addChecklist'])->name('task.addChecklist');
    Route::post('task-info/{taskId}', [TaskController::class, 'getTaskInfo'])->name('task.getTaskInfo');
    Route::post('add-comment', [TaskController::class, 'addComment'])->name('task.addComment');
    Route::post('delete-comment', [TaskController::class, 'deleteComment'])->name('task.deleteComment');

    // list & kanban
    Route::post('list', [TaskController::class, 'listApi'])->name('task.api.list');
});

// task
Route::group(['prefix' => 'tasks'], function () {
    Route::get('dashboard', [TaskController::class, 'dashboard'])->name('task.dashboard');

    Route::get('{parentName}/list', [TaskController::class, 'index'])->name('task.list');
    Route::post('{parentName}/add', [TaskController::class, 'store'])->name('task.add');
    // Route::post('{parentName}/sort-order', [TaskController::class, 'sortOrder'])->name('task.sortOrder');
    Route::post('{parentName}/add-express', [TaskController::class, 'addExpress'])->name('task.addTaskExpress');

    Route::post('{parentName}/add-config/{currentTable}', [TaskController::class, 'editConfig'])->name('task.editConfig');
    Route::post('{parentName}/delete-config/{currentTable}', [TaskController::class, 'deleteConfig'])->name('task.deleteConfig');
});
