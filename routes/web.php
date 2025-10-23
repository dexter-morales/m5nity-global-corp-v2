<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Members\MemberDashboardController;
use App\Http\Controllers\Members\MemberRegistrationController;
use App\Http\Controllers\Members\MemberPinController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'member'])->group(function () {
    // Main user landing -> Binary Dashboard
    Route::get('dashboard', [MemberDashboardController::class, 'index'])
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
