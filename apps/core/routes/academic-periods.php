<?php

use App\Http\Controllers\AcademicPeriods\AcademicPeriodController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('academic-periods/{academic_period}/set-active', [AcademicPeriodController::class, 'setActive'])
        ->name('academic-periods.set-active');

    Route::resource('academic-periods', AcademicPeriodController::class)
        ->except(['create', 'edit', 'show']);
});
