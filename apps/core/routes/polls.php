<?php

use App\Http\Controllers\Polls\PollController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::post('polls/{poll}/publish', [PollController::class, 'publish'])->name('polls.publish');
    Route::post('polls/{poll}/archive', [PollController::class, 'archive'])->name('polls.archive');
    Route::post('polls/{poll}/vote', [PollController::class, 'vote'])->name('polls.vote');
    Route::post('polls/{poll}/options/{option}/merge', [PollController::class, 'mergeOption'])->name('polls.options.merge');

    Route::resource('polls', PollController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
});
