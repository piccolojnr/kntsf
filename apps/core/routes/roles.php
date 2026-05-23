<?php

use App\Http\Controllers\Roles\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::resource('roles', RoleController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);
});
