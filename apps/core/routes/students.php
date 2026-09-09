<?php

use App\Http\Controllers\Students\StudentAccountController;
use App\Http\Controllers\Students\StudentController;
use App\Http\Controllers\Students\StudentImportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->prefix('dashboard')->group(function () {
    Route::get('students/import', [StudentImportController::class, 'show'])
        ->name('students.import.show');
    Route::get('students/import/template', [StudentImportController::class, 'template'])
        ->name('students.import.template');
    Route::post('students/import/preview', [StudentImportController::class, 'preview'])
        ->name('students.import.preview');
    Route::post('students/import', [StudentImportController::class, 'store'])
        ->name('students.import.store');

    Route::post('students/{student}/activate-account', [StudentAccountController::class, 'activate'])
        ->middleware('can:activateAccount,student')
        ->name('students.activate-account');

    Route::resource('students', StudentController::class)->except(['create', 'edit']);
});
