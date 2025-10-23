<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\MemberIncomeHistory;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MemberIncomeController extends Controller
{
    private const LOG_FILE = 'MemberIncome_logs.log';

    public function index(): Response
    {
        $user = Auth::user();
        $member = $user?->memberInfo;

        if (! $member) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Member profile missing while viewing income history.', ['user_id' => $user?->id]);

            return Inertia::render('Members/Income/Index', [
                'auth' => ['user' => $user],
                'incomes' => [],
                'message' => 'Member profile not found.',
            ]);
        }

        $accountIds = $member->accounts()->pluck('id');

        $incomes = MemberIncomeHistory::with(['pairing.leftAccount', 'pairing.rightAccount'])
            ->whereIn('ancestor_account_id', $accountIds)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(function (MemberIncomeHistory $row) {
                $pair = $row->pairing;
                return [
                    'id' => $row->id,
                    'amount' => $row->amount,
                    'source' => $row->source,
                    'description' => $row->description,
                    'created_at' => optional($row->created_at)->toIso8601String(),
                    'level' => $pair?->level,
                    'left_account_id' => $pair?->left_account_id,
                    'right_account_id' => $pair?->right_account_id,
                ];
            })
            ->values();

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loaded member income history.', [
            'user_id' => $user->id,
            'count' => $incomes->count(),
        ]);

        return Inertia::render('Members/Income/Index', [
            'auth' => ['user' => $user],
            'incomes' => $incomes,
            'message' => null,
        ]);
    }
}

