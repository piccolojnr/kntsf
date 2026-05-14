<?php

use App\Http\Controllers\Auth\SetupPasswordController;
use App\Support\ActivityFeed;
use App\Support\DashboardSummary;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome', [
    'canRegister' => false,
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function (ActivityFeed $activityFeed, DashboardSummary $dashboardSummary) {
        return Inertia::render('dashboard', [
            'summary' => $dashboardSummary->counts(),
            'warnings' => $dashboardSummary->warnings(),
            'contentReadiness' => $dashboardSummary->contentReadiness(),
            'recentActivity' => $activityFeed->items(8),
        ]);
    })->name('dashboard');
});

Route::middleware('guest')->group(function () {
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
require __DIR__.'/audit-logs.php';
require __DIR__.'/reports.php';
require __DIR__.'/executives.php';
require __DIR__.'/roles.php';
require __DIR__.'/announcements.php';
require __DIR__.'/events.php';
