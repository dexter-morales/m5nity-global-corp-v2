<?php

use App\Http\Controllers\Accounting\AccountingDashboardController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Members\MemberDashboardController;
use App\Http\Controllers\Members\MemberOverviewController;
use App\Http\Controllers\Members\MemberRegistrationController;
use App\Http\Controllers\Superadmin\SuperadminDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'member'])->group(function () {
    // Main user landing -> Members Overview
    Route::get('dashboard', [MemberOverviewController::class, 'index'])
        ->name('dashboard');

    // Short binary dashboard path (legacy)
    Route::get('binary', [MemberDashboardController::class, 'index'])
        ->name('binary.dashboard');

    // Binary registration (legacy path)
    Route::post('binary/register', [MemberRegistrationController::class, 'store'])
        ->name('binary.register');
});

require __DIR__.'/settings.php';
require __DIR__.'/members.php';
require __DIR__.'/cashier.php';
require __DIR__.'/encashments.php';
require __DIR__.'/superadmin.php';

// Role dashboards
Route::middleware(['auth', 'role:admin,superadmin'])->get('/admin', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
Route::middleware(['auth', 'role:superadmin'])->get('/superadmin', [SuperadminDashboardController::class, 'index'])->name('superadmin.dashboard');
Route::middleware(['auth', 'role:accounting'])->get('/accounting', [AccountingDashboardController::class, 'index'])->name('accounting.dashboard');
