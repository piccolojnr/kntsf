<?php

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PermitRequestController;
use App\Http\Controllers\Public\PublicAnnouncementController;
use App\Http\Controllers\Public\PublicDocumentController;
use App\Http\Controllers\Public\PublicElectionController;
use App\Http\Controllers\Public\PublicEventController;
use App\Http\Controllers\Public\PublicExecutiveController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:public-content')->group(function () {
    Route::get('/', HomeController::class)->name('home');

    Route::prefix('public')->name('public.')->group(function () {
        Route::get('announcements', [PublicAnnouncementController::class, 'index'])->name('announcements.index');
        Route::get('announcements/{announcement:slug}', [PublicAnnouncementController::class, 'show'])->name('announcements.show');

        Route::get('events', [PublicEventController::class, 'index'])->name('events.index');
        Route::get('events/{event:slug}', [PublicEventController::class, 'show'])->name('events.show');

        Route::get('documents', [PublicDocumentController::class, 'index'])->name('documents.index');
        Route::get('documents/{document:slug}', [PublicDocumentController::class, 'show'])->name('documents.show');

        Route::get('executives', PublicExecutiveController::class)->name('executives.index');

        Route::get('elections', [PublicElectionController::class, 'index'])->name('elections.index');
        Route::get('elections/{election:slug}', [PublicElectionController::class, 'show'])->name('elections.show');
    });

    Route::redirect('announcements', '/public/announcements', 301);
    Route::get('announcements/{announcement}', fn (string $announcement) => redirect()->route('public.announcements.show', $announcement, 301));

    Route::redirect('events/public', '/public/events', 301);
    Route::get('events/public/{event}', fn (string $event) => redirect()->route('public.events.show', $event, 301));

    Route::redirect('documents/public', '/public/documents', 301);
    Route::get('documents/public/{document}', fn (string $document) => redirect()->route('public.documents.show', $document, 301));

    Route::redirect('executives/public', '/public/executives', 301);

    Route::redirect('elections/public', '/public/elections', 301);
    Route::get('elections/public/{election}', fn (string $election) => redirect()->route('public.elections.show', $election, 301));
});

Route::prefix('permit-request')
    ->name('public.permit-request.')
    ->middleware('throttle:public-content')
    ->group(function () {
        Route::get('/', [PermitRequestController::class, 'index'])->name('index');
        Route::post('/', [PermitRequestController::class, 'store'])->middleware('throttle:sensitive-actions')->name('store');
        Route::get('preview', [PermitRequestController::class, 'preview'])->name('preview');
        Route::get('payment/callback', [PermitRequestController::class, 'callback'])->middleware('throttle:sensitive-actions')->name('callback');
        Route::get('success/{reference}', [PermitRequestController::class, 'success'])->name('success');
        Route::get('{reference}', [PermitRequestController::class, 'show'])->name('show');
    });
