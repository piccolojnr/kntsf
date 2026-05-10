<?php

use App\Http\Controllers\Audit\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('audit-logs', AuditLogController::class)->name('audit-logs.index');
});
