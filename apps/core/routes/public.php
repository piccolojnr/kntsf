<?php

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PublicAnnouncementController;
use App\Http\Controllers\Public\PublicDocumentController;
use App\Http\Controllers\Public\PublicElectionController;
use App\Http\Controllers\Public\PublicEventController;
use App\Http\Controllers\Public\PublicExecutiveController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('announcements', [PublicAnnouncementController::class, 'index'])->name('public.announcements.index');
Route::get('announcements/{announcement:slug}', [PublicAnnouncementController::class, 'show'])->name('public.announcements.show');

Route::get('events/public', [PublicEventController::class, 'index'])->name('public.events.index');
Route::get('events/public/{event:slug}', [PublicEventController::class, 'show'])->name('public.events.show');

Route::get('documents/public', [PublicDocumentController::class, 'index'])->name('public.documents.index');
Route::get('documents/public/{document:slug}', [PublicDocumentController::class, 'show'])->name('public.documents.show');

Route::get('executives/public', PublicExecutiveController::class)->name('public.executives.index');

Route::get('elections/public', [PublicElectionController::class, 'index'])->name('public.elections.index');
Route::get('elections/public/{election:slug}', [PublicElectionController::class, 'show'])->name('public.elections.show');
