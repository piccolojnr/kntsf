<?php

use App\Http\Controllers\Reports\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::get('reports', ReportController::class)->name('reports.index');
});
