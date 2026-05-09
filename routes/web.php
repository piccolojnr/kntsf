<?php

use App\Http\Controllers\Auth\SetupPasswordController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
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
