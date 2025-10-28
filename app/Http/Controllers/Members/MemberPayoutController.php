<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MemberPayoutController extends Controller
{
    private const LOG_FILE = 'MemberPayout_logs.log';

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $member = $user?->memberInfo;

        $search = trim((string) $request->query('search', ''));
        $sort = $request->query('sort', 'created_at');
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['created_at', 'amount', 'level', 'type'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }

        if (! $member) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Member profile missing while viewing payout history.', ['user_id' => $user?->id]);

            return Inertia::render('Members/Payouts/Index', [
                'auth' => ['user' => $user],
                'payouts' => new LengthAwarePaginator([], 0, 10, 1, [
                    'path' => LengthAwarePaginator::resolveCurrentPath(),
                    'pageName' => 'page',
                ]),
                'filters' => [
                    'search' => $search,
                    'sort' => $sort,
                    'direction' => $direction,
                ],
                'message' => 'Member profile not found.',
            ]);
        }

        $payouts = Payout::query()
            ->where('user_id', $user->id)
            ->when($search !== '', function ($query) use ($search) {
                $like = '%'.$search.'%';
                $query->where(function ($inner) use ($like) {
                    $inner->where('type', 'like', $like)
                        ->orWhere('amount', 'like', $like)
                        ->orWhere('level', 'like', $like)
                        ->orWhereRaw('DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") like ?', [$like]);
                });
            })
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString()
            ->through(function (Payout $payout) {
                return [
                    'id' => $payout->id,
                    'level' => $payout->level,
                    'amount' => $payout->amount,
                    'type' => $payout->type,
                    'created_at' => optional($payout->created_at)->toIso8601String(),
                ];
            });

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loaded member payout history.', [
            'user_id' => $user->id,
            'count' => $payouts->total(),
        ]);

        return Inertia::render('Members/Payouts/Index', [
            'auth' => ['user' => $user],
            'payouts' => $payouts,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'message' => null,
        ]);
    }
}
