<?php

use App\Http\Controllers\Permits\PermitController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::post('permits/{permit}/revoke', [PermitController::class, 'revoke'])
        ->middleware('throttle:sensitive-actions')
        ->name('permits.revoke');

    Route::post('permits/{permit}/mark-card-delivered', [PermitController::class, 'markCardDelivered'])
        ->middleware('throttle:sensitive-actions')
        ->name('permits.mark-card-delivered');

    Route::resource('permits', PermitController::class)
        ->only(['index', 'store', 'show', 'destroy']);
});
