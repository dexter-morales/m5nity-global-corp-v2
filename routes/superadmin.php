<?php

use App\Http\Controllers\ReverbTestController;
use App\Http\Controllers\Superadmin\ActivityLogController;
use App\Http\Controllers\Superadmin\CompanySettingsController;
use App\Http\Controllers\Superadmin\StaffManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Superadmin Routes
|--------------------------------------------------------------------------
|
| Routes for superadmin functionalities including staff management,
| company settings, and full system access.
|
*/

Route::middleware(['auth', 'role:superadmin'])->prefix('superadmin')->name('superadmin.')->group(function () {

    // Staff Management
    Route::resource('staff', StaffManagementController::class);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])
        ->name('activity-logs');

    // Company Settings
    Route::get('/settings/company', [CompanySettingsController::class, 'edit'])
        ->name('settings.company');
    Route::put('/settings/company', [CompanySettingsController::class, 'update'])
        ->name('settings.company.update');
    Route::delete('/settings/company/logo', [CompanySettingsController::class, 'removeLogo'])
        ->name('settings.company.logo.remove');
});

// Reverb Test Routes (accessible to all authenticated users for testing)
Route::middleware(['auth'])->group(function () {
    Route::get('/reverb-test', [ReverbTestController::class, 'index'])
        ->name('reverb-test');
    Route::post('/reverb-test/trigger', [ReverbTestController::class, 'triggerTestEvent'])
        ->name('reverb-test.trigger');
    Route::post('/reverb-test/trigger-order/{orderId}', [ReverbTestController::class, 'triggerOrderEvent'])
        ->name('reverb-test.trigger-order');
    Route::get('/reverb-test/logs', [ReverbTestController::class, 'getLogs'])
        ->name('reverb-test.logs');
});
