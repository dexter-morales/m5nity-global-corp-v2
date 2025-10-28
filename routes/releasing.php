<?php

use App\Http\Controllers\Releasing\ReleasingDashboardController;
use App\Http\Controllers\Releasing\ReleasingOrdersController;
use App\Http\Controllers\Releasing\ReleasingRegistrationsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:releasing_personnel'])->prefix('releasing')->name('releasing.')->group(function () {
    Route::get('/', [ReleasingDashboardController::class, 'index'])
        ->name('dashboard');

    // Orders - Read-only view with release capability
    Route::get('/orders', [ReleasingOrdersController::class, 'index'])
        ->name('orders.index');

    Route::post('/orders/{id}/release', [ReleasingOrdersController::class, 'markAsReleased'])
        ->name('orders.release');

    Route::post('/orders/bulk/release', [ReleasingOrdersController::class, 'bulkMarkAsReleased'])
        ->name('orders.bulk-release');

    // Registrations - Read-only view with release capability
    Route::get('/registrations', [ReleasingRegistrationsController::class, 'index'])
        ->name('registrations.index');

    Route::post('/registrations/{id}/release', [ReleasingRegistrationsController::class, 'markAsReleased'])
        ->name('registrations.release');
});
