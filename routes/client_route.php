<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Client\Whmcs\ClientPortalController;

/*
|--------------------------------------------------------------------------
| Client Portal Routes
|--------------------------------------------------------------------------
|
| Routes for WHMCS Client Portal - Customer-facing area
| These routes require client authentication (separate from admin auth)
|
*/

// Client Portal - Public endpoints
Route::prefix('client')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [ClientPortalController::class, 'dashboard'])->name('client.dashboard');
    
    // Profile
    Route::get('/profile', [ClientPortalController::class, 'profile'])->name('client.profile');
    Route::put('/profile', [ClientPortalController::class, 'updateProfile'])->name('client.profile.update');
    
    // Invoices
    Route::get('/invoices', [ClientPortalController::class, 'invoices'])->name('client.invoices');
    Route::get('/invoices/{id}', [ClientPortalController::class, 'invoiceDetail'])->name('client.invoices.detail');
    
    // Services
    Route::get('/services', [ClientPortalController::class, 'services'])->name('client.services');
    Route::get('/services/{id}', [ClientPortalController::class, 'serviceDetail'])->name('client.services.detail');
    
    // Domains
    Route::get('/domains', [ClientPortalController::class, 'domains'])->name('client.domains');
    
    // Tickets
    Route::get('/tickets', [ClientPortalController::class, 'tickets'])->name('client.tickets');
    Route::get('/tickets/{id}', [ClientPortalController::class, 'ticketDetail'])->name('client.tickets.detail');
    Route::post('/tickets', [ClientPortalController::class, 'createTicket'])->name('client.tickets.create');
    Route::post('/tickets/{id}/reply', [ClientPortalController::class, 'replyTicket'])->name('client.tickets.reply');
    Route::post('/tickets/{id}/close', [ClientPortalController::class, 'closeTicket'])->name('client.tickets.close');
    
    // Payment Methods
    Route::get('/payment-methods', [ClientPortalController::class, 'paymentMethods'])->name('client.payment-methods');
});

// Payment Gateway Callbacks (No auth required)
Route::prefix('payment')->group(function () {
    Route::post('/create', [\App\Http\Controllers\Client\Whmcs\PaymentController::class, 'createPayment'])->name('payment.create');
    
    // VNPay
    Route::get('/vnpay/callback', [\App\Http\Controllers\Client\Whmcs\PaymentController::class, 'vnpayCallback'])->name('payment.vnpay.callback');
    
    // MoMo
    Route::post('/momo/ipn', [\App\Http\Controllers\Client\Whmcs\PaymentController::class, 'momoCallback'])->name('payment.momo.ipn');
    Route::get('/momo/return', [\App\Http\Controllers\Client\Whmcs\PaymentController::class, 'momoCallback'])->name('payment.momo.return');
});
