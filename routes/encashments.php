<?php

use App\Http\Controllers\EncashmentController;
use Illuminate\Support\Facades\Route;

// Member routes - submit encashment requests and view their own
Route::middleware(['auth', 'member'])->group(function () {
    Route::get('/encashments', [EncashmentController::class, 'index'])
        ->name('encashments.index');
    Route::post('/encashments', [EncashmentController::class, 'store'])
        ->name('encashments.store');
    Route::get('/encashments/{encashment}', [EncashmentController::class, 'show'])
        ->name('encashments.show');
});

// Admin routes - approve/reject encashment requests
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('role:admin,super_admin,superadmin')->group(function () {
        Route::get('/encashments', [EncashmentController::class, 'index'])
            ->name('encashments.index');
        Route::post('/encashments/{encashment}/approve', [EncashmentController::class, 'approve'])
            ->name('encashments.approve');
        Route::post('/encashments/{encashment}/reject', [EncashmentController::class, 'reject'])
            ->name('encashments.reject');
        Route::get('/encashments/{encashment}', [EncashmentController::class, 'show'])
            ->name('encashments.show');
    });
});

// Accounting routes - process approved encashments and generate vouchers
Route::middleware(['auth'])->prefix('accounting')->name('accounting.')->group(function () {
    Route::middleware('role:accounting')->group(function () {
        Route::get('/encashments', [EncashmentController::class, 'index'])
            ->name('encashments.index');
        Route::post('/encashments/{encashment}/process', [EncashmentController::class, 'process'])
            ->name('encashments.process');
        Route::get('/encashments/{encashment}', [EncashmentController::class, 'show'])
            ->name('encashments.show');
    });
});

// Cashier routes - release processed encashments
Route::middleware(['auth'])->prefix('cashier')->name('cashier.')->group(function () {
    Route::middleware('role:cashier,admin,super_admin,superadmin')->group(function () {
        Route::get('/encashments', [EncashmentController::class, 'index'])
            ->name('encashments.index');
        Route::post('/encashments/{encashment}/release', [EncashmentController::class, 'release'])
            ->name('encashments.release');
        Route::get('/encashments/{encashment}', [EncashmentController::class, 'show'])
            ->name('encashments.show');
    });
});
