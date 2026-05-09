<?php

use App\Http\Controllers\NfcCards\NfcCardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('nfc-cards/{nfc_card}/replace', [NfcCardController::class, 'replace'])
        ->name('nfc-cards.replace');

    Route::post('nfc-cards/{nfc_card}/mark-lost', [NfcCardController::class, 'markLost'])
        ->name('nfc-cards.mark-lost');

    Route::post('nfc-cards/{nfc_card}/revoke', [NfcCardController::class, 'revoke'])
        ->name('nfc-cards.revoke');

    Route::resource('nfc-cards', NfcCardController::class)
        ->only(['index', 'store', 'show', 'destroy']);
});
