<?php

use App\Http\Controllers\Announcements\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::post('announcements/{announcement}/publish', [AnnouncementController::class, 'publish'])
        ->name('announcements.publish');

    Route::post('announcements/{announcement}/archive', [AnnouncementController::class, 'archive'])
        ->name('announcements.archive');

    Route::resource('announcements', AnnouncementController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
});
