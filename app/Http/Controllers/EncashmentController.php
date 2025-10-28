<?php

namespace App\Http\Controllers;

use App\Models\Encashment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EncashmentController extends Controller
{
    private const LOG_FILE = 'Encashments_logs.log';

    /**
     * Display a listing of encashments based on user role.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $query = Encashment::with([
            'member.user',
            'approvedBy',
            'processedBy',
            'releasedBy',
            'receivedBy',
            'rejectedBy',
        ]);

        // Filter based on user role
        if ($user->utype === 'member') {
            $member = $user->memberInfo;
            if (! $member) {
                return Inertia::render('Encashments/Index', [
                    'encashments' => [],
                    'availableBalance' => 0,
                    'totalIncome' => 0,
                    'totalEncashed' => 0,
                    'message' => 'Member profile not found.',
                ]);
            }
            $query->where('member_id', $member->id);
        }

        // Apply status filter if provided
        $status = $request->query('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Apply search filter
        $search = $request->query('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('encashment_no', 'like', "%{$search}%")
                    ->orWhere('voucher_no', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($memberQuery) use ($search) {
                        $memberQuery->where('fname', 'like', "%{$search}%")
                            ->orWhere('lname', 'like', "%{$search}%")
                            ->orWhere('MID', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $query->orderBy($sort, $direction);

        $encashments = $query->paginate(15)->withQueryString();

        // Transform the data for frontend
        $encashments->getCollection()->transform(function ($encashment) {
            return [
                'id' => $encashment->id,
                'encashment_no' => $encashment->encashment_no,
                'amount' => $encashment->amount,
                'status' => $encashment->status,
                'member' => [
                    'id' => $encashment->member->id,
                    'name' => $encashment->member->fname.' '.$encashment->member->lname,
                    'MID' => $encashment->member->MID,
                    'email' => $encashment->member->email,
                ],
                'member_notes' => $encashment->member_notes,
                'admin_notes' => $encashment->admin_notes,
                'accounting_notes' => $encashment->accounting_notes,
                'cashier_notes' => $encashment->cashier_notes,
                'approved_by' => $encashment->approvedBy ? [
                    'id' => $encashment->approvedBy->id,
                    'name' => $encashment->approvedBy->name,
                ] : null,
                'approved_at' => $encashment->approved_at?->toIso8601String(),
                'processed_by' => $encashment->processedBy ? [
                    'id' => $encashment->processedBy->id,
                    'name' => $encashment->processedBy->name,
                ] : null,
                'processed_at' => $encashment->processed_at?->toIso8601String(),
                'voucher_no' => $encashment->voucher_no,
                'payment_type' => $encashment->payment_type,
                'released_by' => $encashment->releasedBy ? [
                    'id' => $encashment->releasedBy->id,
                    'name' => $encashment->releasedBy->name,
                ] : null,
                'released_at' => $encashment->released_at?->toIso8601String(),
                'received_by' => $encashment->receivedBy ? [
                    'id' => $encashment->receivedBy->id,
                    'name' => $encashment->receivedBy->name,
                ] : null,
                'received_by_name' => $encashment->received_by_name,
                'received_at' => $encashment->received_at?->toIso8601String(),
                'rejected_by' => $encashment->rejectedBy ? [
                    'id' => $encashment->rejectedBy->id,
                    'name' => $encashment->rejectedBy->name,
                ] : null,
                'rejected_at' => $encashment->rejected_at?->toIso8601String(),
                'rejection_reason' => $encashment->rejection_reason,
                'created_at' => $encashment->created_at->toIso8601String(),
                'updated_at' => $encashment->updated_at->toIso8601String(),
            ];
        });

        // For members, include balance information
        $additionalData = [];
        if ($user->utype === 'member' && $user->memberInfo) {
            $member = $user->memberInfo;
            $additionalData = [
                'availableBalance' => $member->getAvailableBalance(),
                'totalIncome' => $member->getTotalIncome(),
                'totalEncashed' => $member->getTotalEncashed(),
            ];
        }

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Loaded encashment list', [
            'user_id' => $user->id,
            'user_type' => $user->utype,
            'count' => $encashments->total(),
        ]);

        return Inertia::render('Encashments/Index', [
            'encashments' => $encashments,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort' => $sort,
                'direction' => $direction,
            ],
            ...$additionalData,
        ]);
    }

    /**
     * Store a new encashment request (Members only).
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $member = $user->memberInfo;

        if (! $member) {
            return back()->with('error', 'Member profile not found.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'member_notes' => 'nullable|string|max:1000',
        ]);

        $availableBalance = $member->getAvailableBalance();

        if ($validated['amount'] > $availableBalance) {
            return back()->with('error', 'Insufficient balance. Available balance: ₱'.number_format($availableBalance, 2));
        }

        DB::beginTransaction();
        try {
            $encashment = Encashment::create([
                'member_id' => $member->id,
                'encashment_no' => $this->generateEncashmentNumber(),
                'amount' => $validated['amount'],
                'status' => 'pending',
                'member_notes' => $validated['member_notes'] ?? null,
            ]);

            DB::commit();

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Encashment request created', [
                'encashment_id' => $encashment->id,
                'encashment_no' => $encashment->encashment_no,
                'member_id' => $member->id,
                'amount' => $encashment->amount,
            ]);

            return redirect()->route('encashments.index')
                ->with('success', 'Encashment request submitted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to create encashment request', [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to submit encashment request. Please try again.');
        }
    }

    /**
     * Approve an encashment request (Admin only).
     */
    public function approve(Request $request, Encashment $encashment): RedirectResponse
    {
        $user = Auth::user();

        if (! in_array($user->utype, ['admin', 'super_admin', 'superadmin'])) {
            return back()->with('error', 'Unauthorized action.');
        }

        if (! $encashment->canBeApproved()) {
            return back()->with('error', 'This encashment cannot be approved.');
        }

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $encashment->update([
                'status' => 'approved',
                'approved_by' => $user->id,
                'approved_at' => now(),
                'admin_notes' => $validated['admin_notes'] ?? null,
            ]);

            DB::commit();

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Encashment approved', [
                'encashment_id' => $encashment->id,
                'encashment_no' => $encashment->encashment_no,
                'approved_by' => $user->id,
                'amount' => $encashment->amount,
            ]);

            return back()->with('success', 'Encashment request approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to approve encashment', [
                'encashment_id' => $encashment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to approve encashment. Please try again.');
        }
    }

    /**
     * Reject an encashment request (Admin only).
     */
    public function reject(Request $request, Encashment $encashment): RedirectResponse
    {
        $user = Auth::user();

        if (! in_array($user->utype, ['admin', 'super_admin', 'superadmin'])) {
            return back()->with('error', 'Unauthorized action.');
        }

        if (! $encashment->canBeRejected()) {
            return back()->with('error', 'This encashment cannot be rejected.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $encashment->update([
                'status' => 'rejected',
                'rejected_by' => $user->id,
                'rejected_at' => now(),
                'rejection_reason' => $validated['rejection_reason'],
            ]);

            DB::commit();

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Encashment rejected', [
                'encashment_id' => $encashment->id,
                'encashment_no' => $encashment->encashment_no,
                'rejected_by' => $user->id,
                'reason' => $validated['rejection_reason'],
            ]);

            return back()->with('success', 'Encashment request rejected.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to reject encashment', [
                'encashment_id' => $encashment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to reject encashment. Please try again.');
        }
    }

    /**
     * Process an encashment and generate voucher (Accounting only).
     */
    public function process(Request $request, Encashment $encashment): RedirectResponse
    {
        $user = Auth::user();

        if ($user->utype !== 'accounting') {
            return back()->with('error', 'Unauthorized action.');
        }

        if (! $encashment->canBeProcessed()) {
            return back()->with('error', 'This encashment cannot be processed.');
        }

        $validated = $request->validate([
            'payment_type' => 'required|in:voucher,cheque,bank_transfer',
            'accounting_notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $encashment->update([
                'status' => 'processed',
                'processed_by' => $user->id,
                'processed_at' => now(),
                'voucher_no' => $this->generateVoucherNumber(),
                'payment_type' => $validated['payment_type'],
                'accounting_notes' => $validated['accounting_notes'] ?? null,
            ]);

            DB::commit();

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Encashment processed', [
                'encashment_id' => $encashment->id,
                'encashment_no' => $encashment->encashment_no,
                'voucher_no' => $encashment->voucher_no,
                'processed_by' => $user->id,
                'payment_type' => $validated['payment_type'],
            ]);

            return back()->with('success', 'Encashment processed successfully. Voucher No: '.$encashment->voucher_no);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to process encashment', [
                'encashment_id' => $encashment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to process encashment. Please try again.');
        }
    }

    /**
     * Release the encashment (Cashier only).
     */
    public function release(Request $request, Encashment $encashment): RedirectResponse
    {
        $user = Auth::user();

        if (! in_array($user->utype, ['cashier', 'admin', 'super_admin', 'superadmin'])) {
            return back()->with('error', 'Unauthorized action.');
        }

        if (! $encashment->canBeReleased()) {
            return back()->with('error', 'This encashment cannot be released.');
        }

        $validated = $request->validate([
            'received_by_name' => ['required', 'string', 'max:255'],
            'cashier_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::beginTransaction();
        try {
            $encashment->update([
                'status' => 'released',
                'released_by' => $user->id,
                'released_at' => now(),
                'received_by_name' => $validated['received_by_name'],
                'received_at' => now(),
                'cashier_notes' => $validated['cashier_notes'] ?? null,
            ]);

            DB::commit();

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Encashment released', [
                'encashment_id' => $encashment->id,
                'encashment_no' => $encashment->encashment_no,
                'voucher_no' => $encashment->voucher_no,
                'released_by' => $user->id,
                'received_by_name' => $validated['received_by_name'],
            ]);

            return back()->with('success', 'Encashment released successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to release encashment', [
                'encashment_id' => $encashment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to release encashment. Please try again.');
        }
    }

    /**
     * Show a single encashment for printing/details.
     */
    public function show(Encashment $encashment): Response
    {
        $user = Auth::user();

        // Check authorization
        if ($user->utype === 'member') {
            if ($encashment->member->user_id !== $user->id) {
                abort(403, 'Unauthorized access.');
            }
        }

        $encashment->load([
            'member.user',
            'approvedBy',
            'processedBy',
            'releasedBy',
            'receivedBy',
            'rejectedBy',
        ]);

        return Inertia::render('Encashments/Show', [
            'encashment' => [
                'id' => $encashment->id,
                'encashment_no' => $encashment->encashment_no,
                'amount' => $encashment->amount,
                'status' => $encashment->status,
                'member' => [
                    'id' => $encashment->member->id,
                    'name' => $encashment->member->fname.' '.$encashment->member->lname,
                    'MID' => $encashment->member->MID,
                    'email' => $encashment->member->email,
                    'address' => $encashment->member->address,
                    'mobile' => $encashment->member->mobile,
                ],
                'member_notes' => $encashment->member_notes,
                'admin_notes' => $encashment->admin_notes,
                'accounting_notes' => $encashment->accounting_notes,
                'cashier_notes' => $encashment->cashier_notes,
                'approved_by' => $encashment->approvedBy ? [
                    'id' => $encashment->approvedBy->id,
                    'name' => $encashment->approvedBy->name,
                ] : null,
                'approved_at' => $encashment->approved_at?->toIso8601String(),
                'processed_by' => $encashment->processedBy ? [
                    'id' => $encashment->processedBy->id,
                    'name' => $encashment->processedBy->name,
                ] : null,
                'processed_at' => $encashment->processed_at?->toIso8601String(),
                'voucher_no' => $encashment->voucher_no,
                'payment_type' => $encashment->payment_type,
                'released_by' => $encashment->releasedBy ? [
                    'id' => $encashment->releasedBy->id,
                    'name' => $encashment->releasedBy->name,
                ] : null,
                'released_at' => $encashment->released_at?->toIso8601String(),
                'received_by' => $encashment->receivedBy ? [
                    'id' => $encashment->receivedBy->id,
                    'name' => $encashment->receivedBy->name,
                ] : null,
                'received_by_name' => $encashment->received_by_name,
                'received_at' => $encashment->received_at?->toIso8601String(),
                'rejected_by' => $encashment->rejectedBy ? [
                    'id' => $encashment->rejectedBy->id,
                    'name' => $encashment->rejectedBy->name,
                ] : null,
                'rejected_at' => $encashment->rejected_at?->toIso8601String(),
                'rejection_reason' => $encashment->rejection_reason,
                'created_at' => $encashment->created_at->toIso8601String(),
                'updated_at' => $encashment->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Generate a unique encashment number.
     */
    protected function generateEncashmentNumber(): string
    {
        $prefix = 'ENC';
        $year = date('Y');
        $month = date('m');

        $lastEncashment = Encashment::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderByDesc('id')
            ->first();

        $sequence = $lastEncashment ? ((int) substr($lastEncashment->encashment_no, -6)) + 1 : 1;

        return sprintf('%s%s%s%06d', $prefix, $year, $month, $sequence);
    }

    /**
     * Generate a unique voucher number.
     */
    protected function generateVoucherNumber(): string
    {
        $prefix = 'VCH';
        $year = date('Y');
        $month = date('m');

        $lastVoucher = Encashment::whereYear('processed_at', $year)
            ->whereMonth('processed_at', $month)
            ->whereNotNull('voucher_no')
            ->orderByDesc('processed_at')
            ->first();

        $sequence = $lastVoucher ? ((int) substr($lastVoucher->voucher_no, -6)) + 1 : 1;

        return sprintf('%s%s%s%06d', $prefix, $year, $month, $sequence);
    }
}
