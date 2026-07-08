<?php

use App\Http\Controllers\Auth\SetupPasswordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

require __DIR__.'/public.php';

Route::get('health/database', [HealthController::class, 'database'])
    ->middleware('throttle:public-content')
    ->name('health.database');

Route::get('health/queue', [HealthController::class, 'queue'])
    ->middleware('throttle:public-content')
    ->name('health.queue');

Route::get('account/mobile-app', fn () => Inertia::render('account/mobile-app'))
    ->name('account.mobile-app');

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::middleware(['guest', 'throttle:setup-password'])->group(function () {
    Route::get('account/setup-password/{token}', [SetupPasswordController::class, 'show'])
        ->name('account.setup-password.show');

    Route::post('account/setup-password/{token}', [SetupPasswordController::class, 'store'])
        ->name('account.setup-password.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/academic-periods.php';
require __DIR__.'/students.php';
require __DIR__.'/permits.php';
require __DIR__.'/verification.php';
require __DIR__.'/nfc-cards.php';
require __DIR__.'/payments.php';
require __DIR__.'/permit-requests.php';
require __DIR__.'/audit-logs.php';
require __DIR__.'/reports.php';
require __DIR__.'/executives.php';
require __DIR__.'/roles.php';
require __DIR__.'/announcements.php';
require __DIR__.'/events.php';
require __DIR__.'/documents.php';
require __DIR__.'/polls.php';
require __DIR__.'/elections.php';
