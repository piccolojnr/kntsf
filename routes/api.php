<?php

use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\ElectionController;
use App\Http\Controllers\Api\Mobile\OperationsController;
use App\Http\Controllers\Api\Mobile\OperationsPermitRequestController;
use App\Http\Controllers\Api\Mobile\PermitRequestController;
use App\Http\Controllers\Api\Mobile\StudentController;
use App\Http\Controllers\Api\Mobile\VerificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('mobile')->name('mobile.')->group(function () {
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:mobile-login')
            ->name('login');

        Route::post('logout', [AuthController::class, 'logout'])
            ->middleware('auth:sanctum')
            ->name('logout');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me'])->name('me');

        Route::prefix('elections')->name('elections.')->group(function () {
            Route::get('/', [ElectionController::class, 'index'])->name('index');
            Route::get('{election}', [ElectionController::class, 'show'])->name('show');
            Route::get('{election}/results', [ElectionController::class, 'results'])->name('results');
            Route::post('{election}/positions/{position}/vote', [ElectionController::class, 'vote'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('vote');
        });

        Route::prefix('permit-requests')->name('permit-requests.')->group(function () {
            Route::get('options', [PermitRequestController::class, 'options'])->name('options');
            Route::get('/', [PermitRequestController::class, 'index'])->name('index');
            Route::post('/', [PermitRequestController::class, 'store'])
                ->middleware('throttle:mobile-permit-requests')
                ->name('store');
            Route::get('{permit_request:request_reference}', [PermitRequestController::class, 'show'])->name('show');
            Route::post('{permit_request:request_reference}/initialize-payment', [PermitRequestController::class, 'initializePayment'])
                ->middleware('throttle:mobile-permit-requests')
                ->name('initialize-payment');
            Route::post('{permit_request:request_reference}/verify-payment', [PermitRequestController::class, 'verifyPayment'])
                ->middleware('throttle:mobile-permit-requests')
                ->name('verify-payment');
        });

        Route::prefix('student')->name('student.')->group(function () {
            Route::get('profile', [StudentController::class, 'profile'])->name('profile');
            Route::get('permits', [StudentController::class, 'permits'])->name('permits');
            Route::get('nfc-card', [StudentController::class, 'nfcCard'])->name('nfc-card');
            Route::post('nfc-card/report-lost', [StudentController::class, 'reportNfcCardLost'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('nfc-card.report-lost');
        });

        Route::prefix('operations')->name('operations.')->group(function () {
            Route::get('students/search', [OperationsController::class, 'searchStudents'])->name('students.search');
            Route::get('students/{student}', [OperationsController::class, 'showStudent'])->name('students.show');
            Route::post('permits/issue', [OperationsController::class, 'issuePermit'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('permits.issue');
            Route::post('nfc-cards/register', [OperationsController::class, 'registerNfcCard'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('nfc-cards.register');
            Route::post('nfc-cards/{nfcCard}/replace', [OperationsController::class, 'replaceNfcCard'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('nfc-cards.replace');
            Route::post('nfc-cards/{nfcCard}/revoke', [OperationsController::class, 'revokeNfcCard'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('nfc-cards.revoke');

            Route::get('permit-requests', [OperationsPermitRequestController::class, 'index'])->name('permit-requests.index');
            Route::get('permit-requests/{permit_request:request_reference}', [OperationsPermitRequestController::class, 'show'])->name('permit-requests.show');
            Route::post('permit-requests/{permit_request:request_reference}/approve-review', [OperationsPermitRequestController::class, 'approveReview'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('permit-requests.approve-review');
            Route::post('permit-requests/{permit_request:request_reference}/reject-review', [OperationsPermitRequestController::class, 'rejectReview'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('permit-requests.reject-review');
        });

        Route::prefix('verification')->name('verification.')->middleware('throttle:mobile-verification')->group(function () {
            Route::post('student-number', [VerificationController::class, 'studentNumber'])->name('student-number');
            Route::post('permit-code', [VerificationController::class, 'permitCode'])->name('permit-code');
            Route::post('nfc', [VerificationController::class, 'nfc'])->name('nfc');
        });
    });
});
