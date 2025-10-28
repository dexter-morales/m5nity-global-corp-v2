<?php

use App\Http\Controllers\Cashier\CashierDashboardController;
use App\Http\Controllers\Cashier\CashierPosController;
use App\Http\Controllers\Cashier\CashierRegistrationController;
use App\Http\Controllers\Cashier\OrdersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:cashier'])->prefix('cashier')->name('cashier.')->group(function () {
    Route::get('/registrations', [CashierRegistrationController::class, 'index'])
        ->name('registrations.index');

    Route::post('/registrations', [CashierRegistrationController::class, 'store'])
        ->name('registrations.store');

    Route::get('/pos', [CashierPosController::class, 'index'])
        ->name('pos.index');

    Route::post('/purchases', [CashierPosController::class, 'store'])
        ->name('pos.store');

    Route::post('/pos/load-more', [CashierPosController::class, 'loadMore'])
        ->name('pos.load-more');

    // Order management routes
    Route::post('/orders/{id}/move-to-payment', [OrdersController::class, 'moveToPayment'])
        ->name('orders.move-to-payment');

    Route::post('/orders/{id}/mark-as-paid', [OrdersController::class, 'markAsPaid'])
        ->name('orders.mark-as-paid');

    Route::post('/orders/{id}/mark-as-released', [OrdersController::class, 'markAsReleased'])
        ->name('orders.mark-as-released');

    Route::post('/orders/{id}/cancel', [OrdersController::class, 'cancel'])
        ->name('orders.cancel');

    Route::get('/orders/{id}', [OrdersController::class, 'show'])
        ->name('orders.show');

    // Bulk operations
    Route::post('/orders/bulk/mark-as-paid', [OrdersController::class, 'bulkMarkAsPaid'])
        ->name('orders.bulk-mark-as-paid');

    Route::post('/orders/bulk/mark-as-released', [OrdersController::class, 'bulkMarkAsReleased'])
        ->name('orders.bulk-mark-as-released');

    Route::post('/orders/bulk/cancel', [OrdersController::class, 'bulkCancel'])
        ->name('orders.bulk-cancel');

    // Reports and dashboard
    Route::get('/reports', [CashierDashboardController::class, 'reports'])
        ->name('reports');

    Route::get('/dashboard', [CashierDashboardController::class, 'index'])
        ->name('dashboard');
});
