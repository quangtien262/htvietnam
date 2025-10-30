<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\LandingPageController;
use App\Http\Controllers\Admin\PageSettingController;

// page-setting
Route::group(['prefix' => 'page-setting'], function () {
    Route::get('edit/{id}', [PageSettingController::class, 'formBasic'])->name('pageSetting.form');
    Route::post('update', [PageSettingController::class, 'update'])->name('pageSetting.update');
    Route::get('sort-order/{menuId?}', [PageSettingController::class, 'sortOrder'])->name('pageSetting.sort_order');
    Route::post('sort-order/{menuId?}', [PageSettingController::class, 'updateSortOrder']);
    Route::get('create/{menuId?}', [PageSettingController::class, 'listLandingpageDefault'])->name('pageSetting.create');
    Route::post('create/{menuId?}', [PageSettingController::class, 'createLandingpage']);
    Route::post('active', [PageSettingController::class, 'activeLand'])->name('pageSetting.active');
    Route::post('show-in-menu', [PageSettingController::class, 'showInMenu'])->name('pageSetting.show_in_menu');

    Route::post('delete/{tblName}/{id}', [PageSettingController::class, 'deleteData'])->name('pageSetting.deleteData');


    
    Route::post('sort-order-data/{menuId?}', [PageSettingController::class, 'updateSortOrderData'])->name('pageSetting.sort_order_data');
    Route::get('edit-page-setting/{tblName}/{id?}', [PageSettingController::class, 'editPageSetting'])->name('pageSetting.edit');

    Route::get('list-block/{tblName}/{pageId?}', [PageSettingController::class, 'listBlock'])->name('pageSetting.listBlock');
    Route::get('edit-block/{tblName}/{id?}/{pageId?}', [PageSettingController::class, 'editBlock'])->name('pageSetting.editBlock');
    Route::post('save-data/{id?}/{pageId?}', [PageSettingController::class, 'saveData'])->name('saveData');
});