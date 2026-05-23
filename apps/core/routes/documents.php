<?php

use App\Http\Controllers\Documents\DocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'dashboard_access'])->group(function () {
    Route::post('documents/{document}/publish', [DocumentController::class, 'publish'])
        ->name('documents.publish');

    Route::post('documents/{document}/archive', [DocumentController::class, 'archive'])
        ->name('documents.archive');

    Route::resource('documents', DocumentController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
});
