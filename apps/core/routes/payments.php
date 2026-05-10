<?php

use App\Http\Controllers\Payments\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('payments/{payment}/mark-successful', [PaymentController::class, 'markSuccessful'])
        ->name('payments.mark-successful');

    Route::post('payments/{payment}/mark-failed', [PaymentController::class, 'markFailed'])
        ->name('payments.mark-failed');

    Route::post('payments/{payment}/cancel', [PaymentController::class, 'cancel'])
        ->name('payments.cancel');

    Route::resource('payments', PaymentController::class)
        ->only(['index', 'store', 'show', 'destroy']);
});
