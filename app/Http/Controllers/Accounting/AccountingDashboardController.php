<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\MemberIncomeHistory;
use App\Models\Payout;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AccountingDashboardController extends Controller
{
    public function index(): Response
    {
        $monthRange = [now()->startOfMonth(), now()->endOfMonth()];
        $pairingSum = MemberIncomeHistory::whereBetween('created_at', $monthRange)->sum('amount');
        $payoutsSum = Payout::whereBetween('created_at', $monthRange)->sum('amount');
        $payoutsCount = Payout::whereBetween('created_at', $monthRange)->count();

        $recentIncome = MemberIncomeHistory::latest()->limit(20)->get(['id','amount','source','description','created_at']);

        return Inertia::render('Accounting/Dashboard', [
            'metrics' => [
                'pairing_month' => (int) $pairingSum,
                'payouts_month' => (int) $payoutsSum,
                'payouts_count_month' => $payoutsCount,
            ],
            'recentIncome' => $recentIncome,
        ]);
    }
}

