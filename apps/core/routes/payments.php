<?php

use App\Http\Controllers\Payments\PaymentController;
use App\Http\Controllers\Payments\PaystackWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('payments/paystack/webhook', PaystackWebhookController::class)
    ->middleware('throttle:sensitive-actions')
    ->name('payments.paystack.webhook');

Route::middleware(['auth', 'verified', 'dashboard_access'])->prefix('dashboard')->group(function () {
    Route::post('payments/{payment}/mark-successful', [PaymentController::class, 'markSuccessful'])
        ->middleware('throttle:sensitive-actions')
        ->name('payments.mark-successful');

    Route::post('payments/{payment}/mark-failed', [PaymentController::class, 'markFailed'])
        ->middleware('throttle:sensitive-actions')
        ->name('payments.mark-failed');

    Route::post('payments/{payment}/cancel', [PaymentController::class, 'cancel'])
        ->middleware('throttle:sensitive-actions')
        ->name('payments.cancel');

    Route::resource('payments', PaymentController::class)
        ->only(['index', 'store', 'show', 'destroy']);
});
