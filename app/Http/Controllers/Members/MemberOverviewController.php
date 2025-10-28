<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\MemberAccount;
use App\Models\MemberIncomeHistory;
use App\Models\MemberPin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MemberOverviewController extends Controller
{
    private const LOG_FILE = 'MemberOverview_logs.log';

    public function index(Request $request): Response|SymfonyResponse
    {
        $user = Auth::user();
        $member = $user?->memberInfo;

        if (! $member) {
            return Inertia::render('Members/Overview', [
                'auth' => ['user' => $user],
                'accounts' => ['data' => [], 'meta' => []],
                'incomes' => [],
                'totals' => [
                    'earnings_month' => 0,
                    'accounts' => 0,
                    'pins' => 0,
                    'last_pairing_at' => null,
                ],
                'message' => 'Member profile not found.',
            ]);
        }

        $accountsQuery = MemberAccount::with(['placementAccount.memberInfo', 'directSponsor'])
            ->where('member_id', $member->id)
            ->orderByDesc('created_at');

        // Filters
        if ($q = $request->string('q')->toString()) {
            $accountsQuery->where(function ($sub) use ($q) {
                $sub->where('account_name', 'like', "%$q%")
                    ->orWhere('package_type', 'like', "%$q%");
            });
        }
        if ($pkg = $request->string('package')->toString()) {
            $accountsQuery->where('package_type', $pkg);
        }

        // CSV export
        if ($request->boolean('export')) {
            $rows = $accountsQuery->get()->map(function (MemberAccount $acc) {
                return [
                    'Account' => $acc->account_name,
                    'Node' => $acc->node,
                    'Placement' => $acc->placementAccount?->account_name,
                    'Direct Sponsor' => $acc->directSponsor ? trim(($acc->directSponsor->fname ?? '').' '.($acc->directSponsor->lname ?? '')) : null,
                    'Package' => $acc->package_type,
                    'Created' => optional($acc->created_at)->toDateTimeString(),
                    'Status' => 'active',
                ];
            });

            $filename = 'accounts_'.now()->format('Ymd_His').'.csv';

            return Inertia::location(response()->streamDownload(function () use ($rows) {
                $out = fopen('php://output', 'w');
                if ($rows->isNotEmpty()) {
                    fputcsv($out, array_keys($rows->first()));
                    foreach ($rows as $r) {
                        fputcsv($out, $r);
                    }
                }
                fclose($out);
            }, $filename, ['Content-Type' => 'text/csv']));
        }

        $accounts = $accountsQuery->paginate(10)->through(function (MemberAccount $acc) {
            return [
                'id' => $acc->id,
                'account_name' => $acc->account_name,
                'node' => $acc->node,
                'placement_account_name' => $acc->placementAccount?->account_name,
                'direct_sponsor_name' => $acc->directSponsor ? trim(($acc->directSponsor->fname ?? '').' '.($acc->directSponsor->lname ?? '')) : null,
                'package_type' => $acc->package_type,
                'created_at' => optional($acc->created_at)->toIso8601String(),
                'status' => 'active',
            ];
        });

        $accountIds = $accountsQuery->clone()->pluck('id');

        // Calculate earnings from both pairing income and unilevel commissions
        $pairingEarningsMonth = MemberIncomeHistory::whereIn('ancestor_account_id', $accountIds)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('amount');

        $unilevelEarningsMonth = DB::table('commissions')
            ->whereIn('member_account_id', $accountIds)
            ->where('source', 'unilevel')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('amount');
        $referralEarningsMonth = DB::table('commissions')
            ->whereIn('member_account_id', $accountIds)
            ->where('source', 'referral')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('amount');

        $earningsMonth = $pairingEarningsMonth + $unilevelEarningsMonth + $referralEarningsMonth;

        $pinsCount = MemberPin::where('status', 'unused')
            ->where(function ($q) use ($accountIds) {
                $q->whereNull('sponsor_id');
                if ($accountIds->isNotEmpty()) {
                    $q->orWhereIn('sponsor_id', $accountIds);
                }
            })->count();

        $lastIncome = MemberIncomeHistory::whereIn('ancestor_account_id', $accountIds)
            ->latest('created_at')
            ->value('created_at');

        $recentIncomes = MemberIncomeHistory::with('pairing')
            ->whereIn('ancestor_account_id', $accountIds)
            ->latest()
            // ->take(5)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'amount' => $row->amount,
                'level' => $row->pairing?->level,
                'created_at' => optional($row->created_at)->toIso8601String(),
            ]);


        return Inertia::render('Members/Overview', [
            // 'auth' => ['user' => $user],
            'accounts' => $accounts,
            'incomes' => $recentIncomes,
            'totals' => [
                'earnings_month' => (int) $earningsMonth,
                'accounts' => $accounts->count(),
                'pins' => $pinsCount,
                'last_pairing_at' => optional($lastIncome)?->toIso8601String(),
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'package' => $request->string('package')->toString(),
            ],
        ]);
    }
}
