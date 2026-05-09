<?php

use App\Http\Controllers\Permits\PermitController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('permits/{permit}/revoke', [PermitController::class, 'revoke'])
        ->name('permits.revoke');

    Route::post('permits/{permit}/mark-card-delivered', [PermitController::class, 'markCardDelivered'])
        ->name('permits.mark-card-delivered');

    Route::resource('permits', PermitController::class)
        ->only(['index', 'store', 'show', 'destroy']);
});
