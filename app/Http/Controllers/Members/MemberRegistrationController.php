<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\Genealogy;
use App\Models\MemberAccount;
use App\Models\MemberPin;
use App\Services\BinaryPairingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MemberRegistrationController extends Controller
{
    private const LOG_FILE = 'MemberRegistration_logs.log';

    /**
     * Place a pre-registered member (created by the cashier) into the genealogy tree.
     *
     * Workflow:
     * - Validate account name uniqueness and ensure the supplied pin exists.
     * - Confirm the sponsoring member already has a genealogy placement.
     * - Locate the next available slot beneath that sponsor (breadth-first traversal).
     * - Within a transaction, claim the pin, create the member account, and insert the
     *   genealogy node so that all related data stays consistent.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_name' => 'required|string|max:50|unique:members_account,account_name',
            'member_pin_id' => 'required|exists:members_pin,id',
            'is_extension' => 'sometimes|boolean',
        ]);

        $sponsorUser = Auth::user();
        $sponsorMember = $sponsorUser->memberInfo;
        $this->writeControllerLog(self::LOG_FILE, 'info', 'Received member placement request.', ['member_pin_id' => $validated['member_pin_id'], 'sponsor_user_id' => $sponsorUser?->id]);

        // Sponsors must already be part of the tree. Without this, we would be
        // attaching a downline to nowhere and break ancestry resolution.
        if (! $sponsorMember) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Sponsor lacks genealogy placement.', ['sponsor_user_id' => $sponsorUser?->id]);

            return response()->json([
                'success' => false,
                'message' => 'Member profile not found for sponsoring user.',
            ], 422);
        }

        $rootGenealogy = Genealogy::with('account')
            ->where('member_id', $sponsorMember->id)
            ->orderBy('level')
            ->first();

        if (! $rootGenealogy) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Sponsor genealogy root not found.', ['sponsor_member_id' => $sponsorMember->id]);

            return response()->json([
                'success' => false,
                'message' => 'No genealogy entry found for the sponsoring account.',
            ], 422);
        }

        // Figure out where the new member should land beneath the sponsor.
        $slot = $this->findAvailableSlot($rootGenealogy);

        if (! $slot) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'No available slot found for sponsor.', ['sponsor_member_id' => $sponsorMember->id]);

            return response()->json([
                'success' => false,
                'message' => 'No available slot found in your downline.',
            ], 422);
        }

        $sponsorAccountIds = $sponsorMember->accounts()->pluck('id')->all();
        $isExtension = $request->boolean('is_extension', false);

        // Keep all mutations atomic: pin updates, account creation, genealogy insert.
        return DB::transaction(function () use ($validated, $slot, $sponsorMember, $sponsorAccountIds, $isExtension) {
            $pin = MemberPin::with(['newMember.user'])
                ->lockForUpdate()
                ->find($validated['member_pin_id']);

            // If the pin vanished mid-flight (very unlikely) fail gracefully.
            if (! $pin) {
                $this->writeControllerLog(self::LOG_FILE, 'error', 'Unable to locate registration pin during transaction.', ['member_pin_id' => $validated['member_pin_id']]);

                return response()->json([
                    'success' => false,
                    'message' => 'Selected registration pin could not be found.',
                ], 404);
            }

            // Only unused pins can be consumed.
            if ($pin->status !== 'unused') {
                $this->writeControllerLog(self::LOG_FILE, 'warning', 'Registration pin already consumed.', ['member_pin_id' => $pin->id]);

                return response()->json([
                    'success' => false,
                    'message' => 'This registration pin has already been used.',
                ], 422);
            }

            // Guard against someone trying to use a pin reserved for a different sponsor.
            if ($pin->sponsor_id && ! in_array($pin->sponsor_id, $sponsorAccountIds, true)) {
                $this->writeControllerLog(self::LOG_FILE, 'warning', 'Sponsor attempted to use a pin reserved for another account.', ['member_pin_id' => $pin->id, 'pin_sponsor_id' => $pin->sponsor_id]);

                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to use this registration pin.',
                ], 403);
            }

            $memberInfo = $pin->newMember;

            // The cashier should have populated both the user and member info records;
            // if not, the registration is incomplete and cannot proceed.
            if (! $memberInfo || ! $memberInfo->user) {
                $this->writeControllerLog(self::LOG_FILE, 'error', 'Member info linked to pin is incomplete.', ['member_pin_id' => $pin->id]);

                return response()->json([
                    'success' => false,
                    'message' => 'Member profile for this pin is incomplete. Please contact the cashier.',
                ], 422);
            }

            // The parent account represents the exact placement position in the tree.
            $parentAccount = MemberAccount::with('memberInfo')
                ->find($slot['parent_account_id']);

            if (! $parentAccount) {
                $this->writeControllerLog(self::LOG_FILE, 'error', 'Computed parent account could not be found.', ['parent_account_id' => $slot['parent_account_id']]);

                return response()->json([
                    'success' => false,
                    'message' => 'Placement account could not be located.',
                ], 422);
            }

            // Maintain upper lineage so later reports can walk the tree quickly.
            $upperNodes = $parentAccount->upper_nodes ?? [];
            if (! is_array($upperNodes)) {
                $upperNodes = (array) $upperNodes;
            }
            array_unshift($upperNodes, $parentAccount->id);

            // Simple label for the node (e.g., "L3", "R4") useful for UI rendering.
            $nodeLabel = strtoupper(substr($slot['position'], 0, 1)).$slot['level'];

            // Create the operational member account entry that links sponsor, placement,
            // and member profile together.
            $memberAccount = MemberAccount::create([
                'member_id' => $memberInfo->id,
                'account_name' => trim($validated['account_name']),
                'dsponsor' => $sponsorMember->id,
                'under_sponsor' => $parentAccount->id,
                'node' => $nodeLabel,
                'upper_nodes' => $upperNodes,
                'member_type' => $isExtension ? 'extension' : 'member',
                'package_type' => 'standard',
                'rank_id' => null,
            ]);

            // Pair value decays by 30 each level; never let it drop below zero.
            $pairValue = max(0, 300 - (($slot['level'] - 1) * 30));

            // Persist the genealogy edge so the frontend tree can render the node.
            $genealogy = Genealogy::create([
                'user_id' => $memberInfo->user->id,
                'member_id' => $memberInfo->id,
                'members_account_id' => $memberAccount->id,
                'parent_id' => $parentAccount->id,
                'position' => $slot['position'],
                'level' => $slot['level'],
                'pair_value' => $pairValue,
            ]);

            // Activate the new member record now that it has a confirmed placement.
            $memberInfo->update([
                'is_active' => true,
            ]);

            // For unassigned pins, set the sponsor to the actual parent so auditors
            // can trace where the placement happened.
            if (! $pin->sponsor_id) {
                $pin->sponsor_id = $parentAccount->id;
            }

            $pin->status = 'used';
            $pin->save();

            app(BinaryPairingService::class)->handleNewPlacement($memberAccount, $genealogy);

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Member successfully placed into genealogy.', ['new_member_account_id' => $memberAccount->id, 'genealogy_id' => $genealogy->id, 'member_pin_id' => $pin->id]);

            return response()->json([
                'success' => true,
                'message' => 'New member registered successfully.',
                'node' => [
                    'genealogy_id' => $genealogy->id,
                    'account_id' => $memberAccount->id,
                    'position' => $slot['position'],
                ],
            ]);
        });
    }

    /**
     * Locate the first open slot under a given genealogy node.
     *
     * Performs a breadth-first traversal so closer levels fill before deeper ones,
     * matching typical binary tree placement behaviour.
     *
     * @return array{parent_account_id:int, position:string, level:int}|null
     */
    protected function findAvailableSlot(Genealogy $root): ?array
    {
        $queue = [[
            'account_id' => $root->members_account_id,
            'level' => $root->level,
        ]];

        while (! empty($queue)) {
            $current = array_shift($queue);
            $children = Genealogy::where('parent_id', $current['account_id'])
                ->get()
                ->keyBy('position');

            // Prioritise filling the left child.
            if (! isset($children['left'])) {
                return [
                    'parent_account_id' => $current['account_id'],
                    'position' => 'left',
                    'level' => $current['level'] + 1,
                ];
            }

            // Then the right child.
            if (! isset($children['right'])) {
                return [
                    'parent_account_id' => $current['account_id'],
                    'position' => 'right',
                    'level' => $current['level'] + 1,
                ];
            }

            // Otherwise enqueue both children and continue searching.
            foreach (['left', 'right'] as $pos) {
                $child = $children[$pos] ?? null;
                if ($child) {
                    $queue[] = [
                        'account_id' => $child->members_account_id,
                        'level' => $child->level,
                    ];
                }
            }
        }

        $this->writeControllerLog(self::LOG_FILE, 'notice', 'No open slot found during placement search.', ['root_member_account_id' => $root->members_account_id]);

        return null;
    }
}
