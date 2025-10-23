<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\MemberAccount;
use App\Models\MemberInfo;
use App\Models\MemberPin;
use App\Models\TransactionHistory;
use App\Models\User;
use App\Support\IdentifierGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CashierRegistrationController extends Controller
{
    private const LOG_FILE = 'CashierRegistration_logs.log';

    /**
     * Render the cashier registration dashboard with quick stats.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user?->staffProfile;

        $accounts = MemberAccount::with('memberInfo:id,fname,mname,lname,MID')
            ->orderBy('account_name')
            ->get(['id', 'account_name', 'member_id'])
            ->map(function (MemberAccount $account) {
                $member = $account->memberInfo;
                $memberName = $member ? trim(($member->fname ?? '').' '.($member->lname ?? '')) : null;

                return [
                    'id' => $account->id,
                    'account_name' => $account->account_name,
                    'member_name' => $memberName,
                    'mid' => $member->MID ?? null,
                ];
            });

        $transactions = TransactionHistory::with('memberPin')
            ->where('cashier_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function (TransactionHistory $history) {
                return [
                    'id' => $history->id,
                    'trans_no' => $history->trans_no,
                    'payment_method' => $history->payment_method,
                    'member_email' => $history->member_email,
                    'pin' => $history->memberPin?->pin,
                    'created_at' => optional($history->created_at)->toIso8601String(),
                ];
            });

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loaded cashier registration dashboard.', ['cashier_user_id' => $user?->id]);

        return Inertia::render('Cashier/Registration', [
            'accounts' => $accounts,
            'transactions' => $transactions,
            'profile' => $profile ? [
                'first_name' => $profile->first_name,
                'middle_name' => $profile->middle_name,
                'last_name' => $profile->last_name,
                'role' => $profile->role,
                'department' => $profile->department,
                'contact_number' => $profile->contact_number,
            ] : null,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    /**
     * Create a pre-registered member record and generate a registration pin.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|max:100',
            'sponsor_account_id' => 'nullable|exists:members_account,id',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'mobile_number' => 'required|string|max:25',
            'email' => 'required|email|unique:users,email|unique:members_info,email',
        ]);

        $cashierId = Auth::id();
        $this->writeControllerLog(self::LOG_FILE, 'info', 'Cashier initiated member pre-registration.', ['cashier_user_id' => $cashierId, 'member_email' => $validated['email']]);

        if (! $cashierId) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Cashier registration attempted without authentication.', ['member_email' => $validated['email']]);

            return response()->json([
                'success' => false,
                'message' => 'Authentication required to process registrations.',
            ], 401);
        }

        $result = DB::transaction(function () use ($validated, $cashierId, $request) {
            $user = User::create([
                'name' => "{$validated['first_name']} {$validated['last_name']}",
                'email' => $validated['email'],
                'password' => Hash::make('password123'),
                'utype' => 'member',
            ]);

            $mid = IdentifierGenerator::generateMemberId();
            $kickStartToken = Str::uuid()->toString();

            $memberInfo = MemberInfo::create([
                'user_id' => $user->id,
                'MID' => $mid,
                'email' => $validated['email'],
                'fname' => $validated['first_name'],
                'mname' => $validated['middle_name'] ?? null,
                'lname' => $validated['last_name'],
                'mobile' => $validated['mobile_number'],
                'is_active' => false,
                'kick_start_token' => $kickStartToken,
            ]);

            $codes = IdentifierGenerator::generateTransactionNumber();

            $memberPin = MemberPin::create([
                'sponsor_id' => $validated['sponsor_account_id'] ?? null,
                'trans_no' => $codes['transaction'],
                'payment_method' => $validated['payment_method'],
                'new_member_id' => $memberInfo->id,
                'member_email' => $validated['email'],
                'pin' => $codes['pin'],
                'status' => 'unused',
            ]);

            TransactionHistory::create([
                'cashier_id' => $cashierId,
                'member_pin_id' => $memberPin->id,
                'trans_no' => $memberPin->trans_no,
                'payment_method' => $validated['payment_method'],
                'member_email' => $validated['email'],
            ]);
            $this->writeControllerLog(self::LOG_FILE, 'info', 'Generated registration pin for pre-registered member.', ['cashier_user_id' => $cashierId, 'member_pin_id' => $memberPin->id, 'member_email' => $validated['email']]);

            $payload = [
                'success' => true,
                'message' => 'Payment recorded and registration pin generated.',
                'data' => [
                    'transaction' => $codes['transaction'],
                    'mid' => $mid,
                    'pin' => $codes['pin'],
                    'kick_start_token' => $kickStartToken,
                    'member_pin_id' => $memberPin->id,
                ],
            ];

            if ($request->wantsJson()) {
                return response()->json($payload, 201);
            }

            return redirect()
                ->route('cashier.registrations.index')
                ->with('success', 'Registration pin generated successfully.');
        });

        return $result;
    }
}
