<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\MemberIncomeHistory;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MemberIncomeController extends Controller
{
    private const LOG_FILE = 'MemberIncome_logs.log';

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $member = $user?->memberInfo;

        if (! $member) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Member profile missing while viewing income history.', ['user_id' => $user?->id]);

            return Inertia::render('Members/Income/Index', [
                'auth' => ['user' => $user],
                'incomes' => new LengthAwarePaginator([], 0, 10),
                'filters' => [
                    'search' => '',
                    'sort' => 'date',
                    'direction' => 'desc',
                ],
                'message' => 'Member profile not found.',
            ]);
        }

        $accountIds = $member->accounts()->pluck('id')->all();

        $pairingIncomes = MemberIncomeHistory::with(['pairing.leftAccount', 'pairing.rightAccount'])
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
            ->values()
            ->toBase();

        $commissionIncomes = Commission::query()
            ->whereIn('member_account_id', $accountIds)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(function (Commission $row) {
                return [
                    'id' => $row->id,
                    'amount' => $row->amount,
                    'source' => $row->source,
                    'description' => $row->description,
                    'created_at' => optional($row->created_at)->toIso8601String(),
                    'level' => $row->level,
                    'left_account_id' => null,
                    'right_account_id' => null,
                ];
            })
            ->values()
            ->toBase();

        $incomes = $pairingIncomes->merge($commissionIncomes)->values();

        $search = trim((string) $request->query('search', ''));
        $sortField = $request->query('sort', 'date');
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $page = max((int) $request->query('page', 1), 1);
        $perPage = 10;

        $filtered = $this->filterIncomeCollection($incomes, $search);
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

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loaded member income history.', [
            'user_id' => $user->id,
            'count' => $total,
        ]);

        return Inertia::render('Members/Income/Index', [
            'auth' => ['user' => $user],
            'incomes' => $paginator,
            'filters' => [
                'search' => $search,
                'sort' => $sortField,
                'direction' => $direction,
            ],
            'message' => null,
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, array<string, mixed>>  $collection
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
     * @param  \Illuminate\Support\Collection<int, array<string, mixed>>  $collection
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
