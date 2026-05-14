<?php

use App\Http\Controllers\Events\EventController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('events/{event}/publish', [EventController::class, 'publish'])
        ->name('events.publish');

    Route::post('events/{event}/archive', [EventController::class, 'archive'])
        ->name('events.archive');

    Route::resource('events', EventController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
});
