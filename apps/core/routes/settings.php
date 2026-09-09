<?php

use App\Http\Controllers\Settings\ContentSettingsController;
use App\Http\Controllers\Settings\PermitSettingsController;
use App\Http\Controllers\Settings\PlatformSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'dashboard_access'])->group(function () {
    Route::redirect('dashboard/settings', '/dashboard/settings/profile');

    Route::get('dashboard/settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('dashboard/settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::delete('dashboard/settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('dashboard/settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::get('dashboard/settings/permit-settings', [PermitSettingsController::class, 'edit'])
        ->name('permit-settings.edit');

    Route::patch('dashboard/settings/permit-settings', [PermitSettingsController::class, 'update'])
        ->name('permit-settings.update');

    Route::get('dashboard/settings/platform-settings', [PlatformSettingsController::class, 'edit'])
        ->name('platform-settings.edit');

    Route::patch('dashboard/settings/platform-settings', [PlatformSettingsController::class, 'update'])
        ->name('platform-settings.update');

    Route::get('dashboard/settings/content-settings', [ContentSettingsController::class, 'edit'])
        ->name('content-settings.edit');

    Route::patch('dashboard/settings/content-settings', [ContentSettingsController::class, 'update'])
        ->name('content-settings.update');

    Route::put('dashboard/settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('dashboard/settings/appearance', 'settings/appearance')->name('appearance.edit');
});
