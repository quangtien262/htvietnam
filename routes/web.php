<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\AIO\AIOController;
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
Route::get('account/logout/user', [AuthController::class, 'logoutUser'])->name('logout');
Route::get('account/logout/aio', [AuthController::class, 'logoutAIO'])->name('logoutAIO');

Route::get('get-token/{type}', [PagesController::class, 'getToken'])->name('get_token');

Route::get('lang/change', [LangController::class, 'change'])->name('changeLang');

Route::middleware('auth:web')->group(function () {
    // api
    Route::group(['prefix' => 'user/api'], function () {
        require __DIR__ . '/user_api_route.php';
    });

    // SPA cho trang profile của khách hàng sau khi login
    Route::get('user/{any?}', [UserController::class, 'index'])->where('any', '.*')->name('user.spa_fallback');
});

Route::middleware('auth:admin_users')->group(function () {
    // Route::get('/', [PagesController::class, 'index'])->name('home');
    // Route::get('/', [AdminController::class, 'index'])->name('home');

    // SPA cho trang quản trị admin
    Route::get('aio/{any?}', [AIOController::class, 'dashboard'])->name('dashboard')->where('any', '.*');

    Route::group(['prefix' => 'aio/api'], function () {
        require __DIR__ . '/aio_route.php';
        require __DIR__ . '/admin_route.php';
    });

    Route::group(['prefix' => 'purchase'], function () {
        require __DIR__ . '/purchase_route.php';
    });

    Route::group(['prefix' => 'adm'], function () {
        // require __DIR__ . '/admin_route.php';
        require __DIR__ . '/admin_web_route.php';
    });
    require __DIR__ . '/himalaya_route.php';
});

// user_route
require __DIR__ . '/user_route.php';
