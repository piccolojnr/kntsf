<?php

use App\Http\Controllers\Executives\ExecutiveController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->prefix('dashboard')->group(function () {
    Route::post('executives/{executive}/activate', [ExecutiveController::class, 'activate'])
        ->name('executives.activate');

    Route::post('executives/{executive}/deactivate', [ExecutiveController::class, 'deactivate'])
        ->name('executives.deactivate');

    Route::post('executives/{executive}/send-setup-link', [ExecutiveController::class, 'sendSetupLink'])
        ->name('executives.send-setup-link');

    Route::resource('executives', ExecutiveController::class)
        ->parameters(['executives' => 'executive'])
        ->only(['index', 'store', 'show', 'update', 'destroy']);
});
