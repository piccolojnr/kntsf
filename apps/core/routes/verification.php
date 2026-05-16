<?php

use App\Http\Controllers\Verification\VerificationController;
use App\Http\Controllers\Verification\VerificationLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('verification', [VerificationController::class, 'index'])
        ->name('verification.index');

    Route::post('verification/student-number', [VerificationController::class, 'verifyStudentNumber'])
        ->middleware('throttle:verification')
        ->name('verification.student-number');

    Route::post('verification/permit-code', [VerificationController::class, 'verifyPermitCode'])
        ->middleware('throttle:verification')
        ->name('verification.permit-code');

    Route::post('verification/nfc', [VerificationController::class, 'verifyNfcUid'])
        ->middleware('throttle:verification')
        ->name('verification.nfc');

    Route::get('verification/logs', [VerificationLogController::class, 'index'])
        ->name('verification.logs');
});
