<?php

use App\Http\Controllers\Cashier\CashierRegistrationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'cashier'])->prefix('cashier')->name('cashier.')->group(function () {
    Route::get('/registrations', [CashierRegistrationController::class, 'index'])
        ->name('registrations.index');

    Route::post('/registrations', [CashierRegistrationController::class, 'store'])
        ->name('registrations.store');
});

