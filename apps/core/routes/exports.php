<?php

use App\Http\Controllers\Exports\AdminTableExportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->prefix('dashboard')->group(function () {
    Route::get('exports/{resource}/{format}', AdminTableExportController::class)
        ->whereIn('format', ['csv', 'excel'])
        ->name('admin-exports.show');
});
