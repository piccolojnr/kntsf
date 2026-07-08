<?php

use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Reports\ReportExportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->prefix('dashboard')->group(function () {
    Route::get('reports', ReportController::class)->name('reports.index');
    Route::get('reports/export/{format}', ReportExportController::class)
        ->whereIn('format', ['pdf', 'csv'])
        ->name('reports.export');
});
