<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\CompensationSetting;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MemberUnilevelController extends Controller
{
    private const LOG_FILE = 'MemberUnilevel_logs.log';

    /**
     * Display unilevel income history and purchases breakdown
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $member = $user?->memberInfo;

        if (! $member) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Member profile missing while viewing unilevel page.', ['user_id' => $user?->id]);

            return Inertia::render('Members/Unilevel/Index', [
                'auth' => ['user' => $user],
                'incomes' => new LengthAwarePaginator([], 0, 10),
                'purchases' => [],
                'summary' => [
                    'total_income' => 0,
                    'total_purchases' => 0,
                    'active_downlines' => 0,
                ],
                'filters' => [
                    'search' => '',
                    'sort' => 'date',
                    'direction' => 'desc',
                ],
                'message' => 'Member profile not found.',
            ]);
        }

        $accountIds = $member->accounts()->pluck('id')->all();

        // Fetch unilevel commission income only
        $unilevelIncomes = Commission::query()
            ->whereIn('member_account_id', $accountIds)
            ->where('source', 'unilevel')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Commission $row) {
                return [
                    'id' => $row->id,
                    'amount' => $row->amount,
                    'source' => $row->source,
                    'description' => $row->description,
                    'created_at' => optional($row->created_at)->toIso8601String(),
                    'level' => $row->level,
                    'percentage' => $row->percentage ?? null,
                    'purchase_id' => $row->purchase_id ?? null,
                ];
            })
            ->values()
            ->toBase();

        // Apply filters
        $search = trim((string) $request->query('search', ''));
        $sortField = $request->query('sort', 'date');
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $page = max((int) $request->query('page', 1), 1);
        $perPage = 10;

        $filtered = $this->filterIncomeCollection($unilevelIncomes, $search);
        $sorted = $this->sortIncomeCollection($filtered, $sortField, $direction);

        $total = $sorted->count();
        $slice = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator($slice, $total, $perPage, $page, [
            'path' => LengthAwarePaginator::resolveCurrentPath(),
            'pageName' => 'page',
        ]);

        $paginator->appends([
            'search' => $search !== '' ? $search : null,
            'sort' => $sortField,
            'direction' => $direction,
        ]);

        // Fetch purchases breakdown by level
        $purchasesBreakdown = $this->getPurchasesBreakdown($accountIds);

        // Calculate summary
        $totalIncome = Commission::whereIn('member_account_id', $accountIds)
            ->where('source', 'unilevel')
            ->sum('amount');

        $totalPurchases = DB::table('purchases')
            ->join('purchase_items', 'purchases.id', '=', 'purchase_items.purchase_id')
            ->whereIn('purchases.buyer_account_id', function ($query) use ($accountIds) {
                $query->select('id')
                    ->from('members_account')
                    ->whereIn('under_sponsor', $accountIds);
            })
            ->sum(DB::raw('purchase_items.quantity * purchase_items.unit_price'));

        $activeDownlines = DB::table('members_account')
            ->whereIn('under_sponsor', $accountIds)
            ->distinct('member_id')
            ->count('member_id');

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loaded member unilevel page.', [
            'user_id' => $user->id,
            'incomes_count' => $total,
            'purchases_breakdown_count' => count($purchasesBreakdown),
        ]);

        return Inertia::render('Members/Unilevel/Index', [
            'auth' => ['user' => $user],
            'incomes' => $paginator,
            'purchases' => $purchasesBreakdown,
            'summary' => [
                'total_income' => (float) $totalIncome,
                'total_purchases' => (float) $totalPurchases,
                'active_downlines' => (int) $activeDownlines,
            ],
            'filters' => [
                'search' => $search,
                'sort' => $sortField,
                'direction' => $direction,
            ],
            'message' => null,
        ]);
    }

    /**
     * Get purchases breakdown by level with total amount and commission percentage
     */
    protected function getPurchasesBreakdown(array $accountIds): array
    {
        if (empty($accountIds)) {
            return [];
        }

        // Get all downline accounts with their levels (using under_sponsor for placement)
        $downlineAccounts = DB::table('members_account as ma')
            ->select('ma.id', 'ma.under_sponsor', DB::raw('1 as level'))
            ->whereIn('ma.under_sponsor', $accountIds)
            ->get();

        // Build a map of account -> level (simple approach for up to 10 levels)
        $accountLevels = [];
        foreach ($downlineAccounts as $acc) {
            $accountLevels[$acc->id] = 1;
        }

        // For simplicity, we'll calculate levels iteratively
        for ($level = 2; $level <= 10; $level++) {
            $previousLevelAccounts = collect($accountLevels)->filter(fn ($l) => $l === $level - 1)->keys()->all();
            if (empty($previousLevelAccounts)) {
                break;
            }

            $nextLevel = DB::table('members_account')
                ->whereIn('under_sponsor', $previousLevelAccounts)
                ->pluck('id')
                ->all();

            foreach ($nextLevel as $accId) {
                if (! isset($accountLevels[$accId])) {
                    $accountLevels[$accId] = $level;
                }
            }
        }

        // Group purchases by level
        $breakdown = [];
        foreach ($accountLevels as $accountId => $level) {
            $purchaseTotal = DB::table('purchases')
                ->join('purchase_items', 'purchases.id', '=', 'purchase_items.purchase_id')
                ->where('purchases.buyer_account_id', $accountId)
                ->sum(DB::raw('purchase_items.quantity * purchase_items.unit_price'));

            if ($purchaseTotal > 0) {
                if (! isset($breakdown[$level])) {
                    $breakdown[$level] = [
                        'level' => $level,
                        'total_purchases' => 0,
                        'percentage' => $this->getCommissionPercentage($level),
                        'commission_value' => 0,
                        'downline_count' => 0,
                    ];
                }

                $breakdown[$level]['total_purchases'] += $purchaseTotal;
                $breakdown[$level]['downline_count'] += 1;
            }
        }

        // Calculate commission values
        foreach ($breakdown as $level => &$data) {
            $data['commission_value'] = $data['total_purchases'] * ($data['percentage'] / 100);
        }

        return array_values($breakdown);
    }

    /**
     * Get commission percentage for a given level
     */
    protected function getCommissionPercentage(int $level): float
    {
        // Fetch from compensation_settings table (single row with JSON unilevel_percents)
        static $settings = null;

        if ($settings === null) {
            $compensationSetting = CompensationSetting::current();
            $settings = $compensationSetting->unilevel_percents ?? [];
        }

        return isset($settings[(string) $level]) ? (float) $settings[(string) $level] : 0;
    }

    /**
     * Filter income collection based on search term
     */
    protected function filterIncomeCollection(Collection $collection, string $search): Collection
    {
        if ($search === '') {
            return $collection;
        }

        $needle = mb_strtolower($search);

        return $collection->filter(function (array $row) use ($needle) {
            $source = mb_strtolower((string) ($row['source'] ?? ''));
            $description = mb_strtolower((string) ($row['description'] ?? ''));
            $amount = (string) ($row['amount'] ?? '');
            $level = (string) ($row['level'] ?? '');
            $date = mb_strtolower((string) ($row['created_at'] ?? ''));

            return str_contains($source, $needle)
                || str_contains($description, $needle)
                || str_contains($amount, $needle)
                || str_contains($level, $needle)
                || ($date !== '' && str_contains($date, $needle));
        })->values();
    }

    /**
     * Sort income collection
     */
    protected function sortIncomeCollection(Collection $collection, string $sort, string $direction): Collection
    {
        switch ($sort) {
            case 'amount':
                $sorted = $collection->sortBy(
                    fn (array $row) => $row['amount'] ?? 0,
                    SORT_REGULAR,
                    $direction === 'desc',
                );
                break;
            default:
                $sorted = $collection->sortBy(
                    fn (array $row) => isset($row['created_at'])
                        ? strtotime((string) $row['created_at'])
                        : 0,
                    SORT_REGULAR,
                    $direction === 'desc',
                );
                break;
        }

        return $sorted->values();
    }
}
