<?php

use App\Http\Controllers\Admin\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\User\LangController;
use App\Http\Controllers\User\NewsController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\PagesController;
use App\Http\Controllers\User\UserController;

// use UniSharp\LaravelFilemanager\Lfm;
// Route::group(['prefix' => 'laravel-filemanager', 'middleware' => ['web', 'auth']], function () {
//     Lfm::routes();
// });

Route::get('/', [PagesController::class, 'index'])->name('home');

// auth
Route::get('adm/login', [AuthController::class, 'login'])->name('login');
Route::post('adm/login', [AuthController::class, 'postLogin']);
Route::post('account/login', [AuthController::class, 'postLogin_api'])->name('postLogin_api');
Route::get('account/register', [AuthController::class, 'register'])->name('register');
Route::post('account/register', [AuthController::class, 'postRegister']);
Route::post('api/register', [AuthController::class, 'postRegister_api'])->name('postRegister_api');
Route::get('account/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/get-token/{type}', [PagesController::class, 'getToken'])->name('get_token');

Route::get('lang/change', [LangController::class, 'change'])->name('changeLang');

Route::middleware('auth:web')->group(function () {
    Route::group(['prefix' => 'user'], function () {
        Route::get('/', [UserController::class, 'index'])->name('user.index');
        Route::get('hoa-don', [UserController::class, 'index'])->name('user.hoa_don');
        Route::get('hop-dong', [UserController::class, 'index'])->name('user.hop_dong');
        Route::get('supponrt', [UserController::class, 'index'])->name('user.support');
        Route::get('/logout', [UserController::class, 'logout'])->name('user.logout');
    });
});

Route::middleware('auth:admin_users')->group(function () {
    // Route::get('/', [PagesController::class, 'index'])->name('home');
    // Route::get('/', [AdminController::class, 'index'])->name('home');

    Route::group(['prefix' => 'aio'], function () {
        require __DIR__ . '/aio.php';
    });


    Route::group(['prefix' => 'adm'], function () {
        require __DIR__ . '/admin_route.php';
        require __DIR__ . '/admin_web_route.php';
    });
    require __DIR__ . '/himalaya_route.php';
});

// user_route
require __DIR__ . '/user_route.php';
