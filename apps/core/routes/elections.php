<?php

use App\Http\Controllers\Elections\ElectionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('elections/{election}/publish', [ElectionController::class, 'publish'])->name('elections.publish');
    Route::post('elections/{election}/start', [ElectionController::class, 'start'])->name('elections.start');
    Route::post('elections/{election}/close', [ElectionController::class, 'close'])->name('elections.close');
    Route::post('elections/{election}/archive', [ElectionController::class, 'archive'])->name('elections.archive');
    Route::post('elections/{election}/positions/{position}/candidates', [ElectionController::class, 'storeCandidate'])->name('elections.candidates.store');
    Route::post('candidates/{candidate}/approve', [ElectionController::class, 'approveCandidate'])->name('candidates.approve');
    Route::post('candidates/{candidate}/reject', [ElectionController::class, 'rejectCandidate'])->name('candidates.reject');
    Route::post('candidates/{candidate}/withdraw', [ElectionController::class, 'withdrawCandidate'])->name('candidates.withdraw');
    Route::post('elections/{election}/positions/{position}/vote', [ElectionController::class, 'vote'])->name('elections.vote');

    Route::resource('elections', ElectionController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
});
