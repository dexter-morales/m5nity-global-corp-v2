<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\MemberPin;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MemberPinController extends Controller
{
    private const LOG_FILE = 'MemberPin_logs.log';

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loading member pin listing.', ['user_id' => $user?->id]);

        $search = trim((string) $request->query('search', ''));
        $sort = $request->query('sort', 'created_at');
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['created_at', 'trans_no', 'status'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }

        $memberInfo = $user?->memberInfo;

        if (! $memberInfo) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Member profile missing while attempting to view pin list.', ['user_id' => $user?->id]);

            return Inertia::render('Members/Pins/Index', [
                'auth' => ['user' => $user],
                'pins' => new LengthAwarePaginator([], 0, 10, 1, [
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

        $accountIds = $memberInfo->accounts()->pluck('id');

        $pins = MemberPin::with('newMember')
            ->when($accountIds->isNotEmpty(), function ($query) use ($accountIds) {
                $query->whereIn('sponsor_id', $accountIds);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($sub) use ($search) {
                    $like = '%'.$search.'%';
                    $sub->where('trans_no', 'like', $like)
                        ->orWhere('member_email', 'like', $like)
                        ->orWhere('pin', 'like', $like)
                        ->orWhere('status', 'like', $like)
                        ->orWhere('payment_method', 'like', $like);
                });
            })
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString()
            ->through(function (MemberPin $pin) {
                $member = $pin->newMember;
                $name = $member ? trim(($member->fname ?? '').' '.($member->lname ?? '')) : null;

                return [
                    'id' => $pin->id,
                    'trans_no' => $pin->trans_no,
                    'payment_method' => $pin->payment_method,
                    'member_email' => $pin->member_email,
                    'pin' => $pin->pin,
                    'status' => $pin->status,
                    'created_at' => optional($pin->created_at)->toIso8601String(),
                    'new_member_name' => $name,
                ];
            });

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Prepared pin listing response.', [
            'user_id' => $user?->id,
            'pin_count' => $pins->count(),
        ]);

        return Inertia::render('Members/Pins/Index', [
            'auth' => ['user' => $user],
            'pins' => $pins,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'message' => null,
        ]);
    }
}
