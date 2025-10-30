<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AIO\AIOController;


Route::get('/', [AIOController::class, 'dashboard'])->name('dashboard');
