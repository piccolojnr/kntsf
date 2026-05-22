<?php

use App\Http\Controllers\PermitRequests\PermitRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('permit-requests', [PermitRequestController::class, 'index'])->name('permit-requests.index');
    Route::get('permit-requests/{permit_request}', [PermitRequestController::class, 'show'])->name('permit-requests.show');
    Route::post('permit-requests/{permit_request}/approve-review', [PermitRequestController::class, 'approveReview'])
        ->middleware('throttle:sensitive-actions')
        ->name('permit-requests.approve-review');
    Route::post('permit-requests/{permit_request}/reject-review', [PermitRequestController::class, 'rejectReview'])
        ->middleware('throttle:sensitive-actions')
        ->name('permit-requests.reject-review');
});
