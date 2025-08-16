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
    Route::post('delete', [PageSettingController::class, 'delete'])->name('pageSetting.delete');
    Route::post('delete', [PageSettingController::class, 'delete'])->name('pageSetting.delete');


    Route::get('edit-page-setting/{tblName}/{id?}', [PageSettingController::class, 'editPageSetting'])->name('pageSetting.edit');
    Route::post('save-data/{pageId?}', [PageSettingController::class, 'saveData'])->name('saveData');
});

// landingpage
Route::group(['prefix' => 'landingpage'], function () {
    Route::get('edit/{id}', [LandingPageController::class, 'formBasic'])->name('land.form');
    Route::post('update', [LandingPageController::class, 'update'])->name('land.update');
    Route::get('sort-order/{menuId}', [LandingPageController::class, 'sortOrder'])->name('land.sort_order');
    Route::post('sort-order', [LandingPageController::class, 'updateSortOrder']);
    Route::get('create/{menuId}', [LandingPageController::class, 'listLandingpageDefault'])->name('land.create');
    Route::post('create', [LandingPageController::class, 'createLandingpage']);
    Route::post('active', [LandingPageController::class, 'activeLand'])->name('land.active');
    Route::post('show-in-menu', [LandingPageController::class, 'showInMenu'])->name('land.show_in_menu');
    Route::post('delete', [LandingPageController::class, 'delete'])->name('land.delete');
    Route::post('delete', [LandingPageController::class, 'delete'])->name('land.delete');
});