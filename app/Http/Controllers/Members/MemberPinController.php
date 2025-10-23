<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\MemberPin;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MemberPinController extends Controller
{
    private const LOG_FILE = 'MemberPin_logs.log';

    /**
     * Show the list of registration pins associated with the member.
     */
    public function index()
    {
        $user = Auth::user();
        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loading member pin listing.', ['user_id' => $user?->id]);
        $memberInfo = $user->memberInfo;

        if (! $memberInfo) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Member profile missing while attempting to view pin list.', ['user_id' => $user?->id]);

            return Inertia::render('Members/Pins/Index', [
                'auth' => ['user' => $user],
                'pins' => [],
                'message' => 'Member profile not found.',
            ]);
        }

        $accountIds = $memberInfo->accounts()->pluck('id');

        $pins = MemberPin::with('newMember')
            ->when($accountIds->isNotEmpty(), function ($query) use ($accountIds) {
                $query->whereIn('sponsor_id', $accountIds);
            })
            ->orderByDesc('created_at')
            ->get(['id', 'trans_no', 'payment_method', 'member_email', 'pin', 'status', 'created_at', 'new_member_id'])
            ->map(function (MemberPin $pin) {
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
            })
            ->values();

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Prepared pin listing response.', ['user_id' => $user?->id, 'pin_count' => $pins->count() ?? 0]);

        return Inertia::render('Members/Pins/Index', [
            'auth' => ['user' => $user],
            'pins' => $pins,
            'message' => null,
        ]);
    }
}
