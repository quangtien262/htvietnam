<?php

use App\Http\Controllers\User\AitilenUserController;
use App\Http\Controllers\User\UserController;



Route::post('profile/change-password', [UserController::class, 'changePassword'])->name('user.change_password');

Route::group(['prefix' => 'aitilen'], function () {
    Route::post('/', [AitilenUserController::class, 'index'])->name('user.index');
    Route::post('invoice', [AitilenUserController::class, 'invoice'])->name('user.hoa_don');
    Route::post('contract', [AitilenUserController::class, 'contract'])->name('user.hop_dong');

    Route::post('support', [AitilenUserController::class, 'support'])->name('user.support');
    Route::post('support/create', [AitilenUserController::class, 'createTask'])->name('user.support.createTask');
    Route::post('task/info', [AitilenUserController::class, 'getTaskInfo'])->name('user.support.getTaskInfo');
    Route::post('task/edit-comment', [AitilenUserController::class, 'addOrEditTaskComment'])->name('user.support.addTaskComment');


    Route::post('profile', [AitilenUserController::class, 'profile'])->name('user.profile');
    Route::post('profile/update', [AitilenUserController::class, 'updateProfile'])->name('user.profile.update');

    // invoice
    Route::post('invoice/index-api', [AitilenUserController::class, 'invoiceIndexApi'])->name('user.invoice.index');
    Route::post('invoice/search', [AitilenUserController::class, 'searchInvoice'])->name('user.invoice.search');

});
