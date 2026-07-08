<?php

use App\Http\Controllers\Settings\ContentSettingsController;
use App\Http\Controllers\Settings\PermitSettingsController;
use App\Http\Controllers\Settings\PlatformSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'dashboard_access'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::get('settings/permit-settings', [PermitSettingsController::class, 'edit'])
        ->name('permit-settings.edit');

    Route::patch('settings/permit-settings', [PermitSettingsController::class, 'update'])
        ->name('permit-settings.update');

    Route::get('settings/platform-settings', [PlatformSettingsController::class, 'edit'])
        ->name('platform-settings.edit');

    Route::patch('settings/platform-settings', [PlatformSettingsController::class, 'update'])
        ->name('platform-settings.update');

    Route::get('settings/content-settings', [ContentSettingsController::class, 'edit'])
        ->name('content-settings.edit');

    Route::patch('settings/content-settings', [ContentSettingsController::class, 'update'])
        ->name('content-settings.update');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
