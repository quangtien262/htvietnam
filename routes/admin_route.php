<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\TaiKhoanNganHangController;
use App\Http\Controllers\Admin\GiaoDichNganHangController;
use App\Http\Controllers\Admin\ERPDashboardController;

// ============================
// MODULE NGÂN HÀNG
// ============================

// Tài khoản ngân hàng
Route::get('/bank/account', [TaiKhoanNganHangController::class, 'index'])->name('bank.account.index');
Route::post('/api/bank/account/list', [TaiKhoanNganHangController::class, 'apiList'])->name('api.bank.account.list');
Route::post('/api/bank/account/add', [TaiKhoanNganHangController::class, 'apiAdd'])->name('api.bank.account.add');
Route::post('/api/bank/account/update', [TaiKhoanNganHangController::class, 'apiUpdate'])->name('api.bank.account.update');
Route::post('/api/bank/account/delete', [TaiKhoanNganHangController::class, 'apiDelete'])->name('api.bank.account.delete');
Route::post('/api/bank/account/update-sort-order', [TaiKhoanNganHangController::class, 'apiUpdateSortOrder'])->name('api.bank.account.update-sort-order');

// Giao dịch ngân hàng
Route::get('/bank/transaction', [GiaoDichNganHangController::class, 'index'])->name('bank.transaction.index');
Route::post('/api/bank/transaction/list', [GiaoDichNganHangController::class, 'apiList'])->name('api.bank.transaction.list');
Route::post('/api/bank/transaction/add', [GiaoDichNganHangController::class, 'apiAdd'])->name('api.bank.transaction.add');
Route::post('/api/bank/transaction/update', [GiaoDichNganHangController::class, 'apiUpdate'])->name('api.bank.transaction.update');
Route::post('/api/bank/transaction/delete', [GiaoDichNganHangController::class, 'apiDelete'])->name('api.bank.transaction.delete');
Route::post('/api/bank/transaction/tai-khoan-list', [GiaoDichNganHangController::class, 'apiTaiKhoanList'])->name('api.bank.transaction.tai-khoan-list');

// ============================
// MODULE ERP DASHBOARD
// ============================

Route::get('/erp/dashboard', [ERPDashboardController::class, 'index'])->name('erp.dashboard.index');
Route::post('/api/erp/dashboard/overview', [ERPDashboardController::class, 'apiOverview'])->name('api.erp.dashboard.overview');
Route::post('/api/erp/dashboard/cash-flow', [ERPDashboardController::class, 'apiCashFlow'])->name('api.erp.dashboard.cash-flow');
Route::post('/api/erp/dashboard/cong-no', [ERPDashboardController::class, 'apiCongNo'])->name('api.erp.dashboard.cong-no');
Route::post('/api/erp/dashboard/chart', [ERPDashboardController::class, 'apiChart'])->name('api.erp.dashboard.chart');

