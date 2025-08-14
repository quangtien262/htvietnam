<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\PagesController as AdminPagesController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\User\LangController;
use App\Http\Controllers\User\NewsController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\PagesController;

// auth
Route::get('login', [AuthController::class, 'login'])->name('login');
Route::post('login', [AuthController::class, 'postLogin']);
Route::get('register', [AuthController::class, 'register'])->name('register');
Route::post('register', [AuthController::class, 'postRegister']);
Route::get('logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/get-token/{type}', [PagesController::class, 'getToken'])->name('get_token');

Route::get('lang/change', [LangController::class, 'change'])->name('changeLang');

Route::middleware('auth:admin_users')->group(function () {
    // Route::get('/', [AdminController::class, 'index'])->name('home');
    Route::group(['prefix' => 'adm'], function () {
            require __DIR__ . '/admin_route.php';
            require __DIR__ . '/admin_web_route.php';
    });
    require __DIR__ . '/himalaya_route.php';
});

// user_route
require __DIR__ . '/user_route.php';

