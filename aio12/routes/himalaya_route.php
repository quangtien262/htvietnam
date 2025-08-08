<?php

use App\Http\Controllers\Admin\AdmApiController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\HimalayaController;



// data
Route::group(['prefix' => 'himalaya'], function () {
    Route::post('card/user', [HimalayaController::class, 'getCardByUser'])->name('himalaya.get_card_by_user');
});



