<?php

use App\Http\Controllers\Members\MemberDashboardController;
use App\Http\Controllers\Members\MemberPinController;
use App\Http\Controllers\Members\MemberRegistrationController;
use App\Http\Controllers\Members\MemberIncomeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'member'])->group(function () {
    // Member binary dashboard
    Route::get('/members/binary', [MemberDashboardController::class, 'index'])
        ->name('members.binary.dashboard');

    // Member pin listing
    Route::get('/members/pins', [MemberPinController::class, 'index'])
        ->name('members.pins');

    // Member placement/registration using a pin
    Route::post('/members/register/placement', [MemberRegistrationController::class, 'store'])
        ->name('members.register.placement');

    // Member income history (pairings)
    Route::get('/members/income', [MemberIncomeController::class, 'index'])
        ->name('members.income');
});
