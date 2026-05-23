<?php

use App\Http\Controllers\Students\StudentAccountController;
use App\Http\Controllers\Students\StudentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::post('students/{student}/activate-account', [StudentAccountController::class, 'activate'])
        ->middleware('can:activateAccount,student')
        ->name('students.activate-account');

    Route::resource('students', StudentController::class)->except(['create', 'edit']);
});
