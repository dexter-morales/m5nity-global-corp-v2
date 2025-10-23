<?php

namespace App\Http\Controllers\Members;

use App\Http\Controllers\Controller;
use App\Models\Genealogy;
use App\Models\MemberPin;
use App\Models\Payout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MemberDashboardController extends Controller
{
    private const LOG_FILE = 'MemberDashboard_logs.log';

    /**
     * Render the member dashboard with genealogy tree, pins, and payouts.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $this->writeControllerLog(self::LOG_FILE, 'info', 'Rendering member dashboard.', ['user_id' => $user?->id]);

        $memberInfo = $user->memberInfo;

        if (! $memberInfo) {
            $this->writeControllerLog(self::LOG_FILE, 'warning', 'Member profile not found for dashboard render.', ['user_id' => $user?->id]);

            return Inertia::render('Members/Binary/Dashboard', [
                'auth' => ['user' => $user],
                'tree' => null,
                'payouts' => [],
                'message' => 'Member profile not found. Please contact support.',
                'availablePins' => [],
            ]);
        }

        // Find the genealogy node for this member's primary account
        $rootNode = Genealogy::with($this->genealogyRelations())
            ->where('member_id', $memberInfo->id)
            ->orderBy('level')
            ->first();

        $focusAccountId = $request->query('account');
        if ($focusAccountId && $rootNode) {
            $target = $this->findNodeInDownline($rootNode, (int) $focusAccountId);
            if ($target) {
                $rootNode = $target;
            }
        }

        $tree = $rootNode ? $this->buildTree($rootNode, 1, 4) : null;
        $this->writeControllerLog(self::LOG_FILE, 'info', 'Built genealogy tree for dashboard.', ['user_id' => $user?->id, 'root_node_id' => $rootNode?->id]);

        // Optional payouts
        $payouts = Payout::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get(['id', 'level', 'amount', 'type', 'created_at']);

        $accountIds = $memberInfo->accounts()->pluck('id');

        $availablePins = MemberPin::with('newMember')
            ->where('status', 'unused')
            ->where(function ($query) use ($accountIds) {
                $query->whereNull('sponsor_id');

                if ($accountIds->isNotEmpty()) {
                    $query->orWhereIn('sponsor_id', $accountIds);
                }
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function (MemberPin $pin) {
                $member = $pin->newMember;

                return [
                    'id' => $pin->id,
                    'member_email' => $pin->member_email,
                    'first_name' => $member?->fname,
                    'middle_name' => $member?->mname,
                    'last_name' => $member?->lname,
                    'mobile_number' => $member?->mobile,
                ];
            })
            ->values()
            ->all();

        $message = null;
        if (! $rootNode) {
            $message = 'You are not yet placed in the binary tree.';
        }

        $this->writeControllerLog(self::LOG_FILE, 'info', 'Dashboard payload prepared.', ['user_id' => $user?->id, 'tree_present' => (bool) $tree]);

        return Inertia::render('Members/Binary/Dashboard', [
            'auth' => ['user' => $user],
            'tree' => $tree,
            'payouts' => $payouts,
            'message' => $message,
            'availablePins' => $availablePins,
        ]);
    }

    /**
     * Build a nested array representation of the genealogy tree up to a maximum depth.
     */
    protected function buildTree($node, $currentLevel = 1, $maxDepth = 4)
    {
        if (! $node || $currentLevel > $maxDepth) {
            return null;
        }

        // Fetch left and right children
        $children = Genealogy::with($this->genealogyRelations())
            ->where('parent_id', $node->members_account_id)
            ->get()
            ->keyBy('position'); // 'left' | 'right'

        $account = $node->account;
        $placementAccount = $account?->placementAccount;
        $directSponsor = $account?->directSponsor;

        return [
            'id' => $node->id,
            'user_id' => $node->user_id,
            'user' => $node->user,
            'member_id' => $node->member_id,
            'members_account_id' => $node->members_account_id,
            'parent_id' => $node->parent_id,
            'position' => $node->position,
            'level' => $node->level,
            'pair_value' => $node->pair_value,
            'meta' => [
                'account_name' => $account?->account_name,
                'member_name' => $account?->memberInfo
                    ? trim(($account->memberInfo->fname ?? '').' '.($account->memberInfo->lname ?? ''))
                    : null,
                'direct_sponsor_member' => $directSponsor
                    ? trim(($directSponsor->fname ?? '').' '.($directSponsor->lname ?? ''))
                    : null,
                'placement_account_name' => $placementAccount?->account_name,
                'placement_member_name' => $placementAccount && $placementAccount->memberInfo
                    ? trim(($placementAccount->memberInfo->fname ?? '').' '.($placementAccount->memberInfo->lname ?? ''))
                    : null,
                'joined_at' => optional($account?->created_at)->toIso8601String(),
                'left_group_value' => $node->pair_value,
                'right_group_value' => 0,
            ],
            'leftChild' => isset($children['left'])
                ? $this->buildTree($children['left'], $currentLevel + 1, $maxDepth)
                : null,
            'rightChild' => isset($children['right'])
                ? $this->buildTree($children['right'], $currentLevel + 1, $maxDepth)
                : null,
        ];
    }

    /**
     * Relationships to eager-load whenever fetching genealogy nodes.
     */
    protected function genealogyRelations(): array
    {
        return [
            'user:id,name,email',
            'account.memberInfo',
            'account.directSponsor',
            'account.placementAccount.memberInfo',
        ];
    }

    /**
     * Locate a specific account within the sponsor's downline tree.
     */
    protected function findNodeInDownline(Genealogy $root, int $accountId): ?Genealogy
    {
        if ($root->members_account_id === $accountId) {
            return $root;
        }

        $queue = [$root];

        while (! empty($queue)) {
            /** @var \App\Models\Genealogy $current */
            $current = array_shift($queue);

            $children = Genealogy::with($this->genealogyRelations())
                ->where('parent_id', $current->members_account_id)
                ->get();

            foreach ($children as $child) {
                if ($child->members_account_id === $accountId) {
                    return $child;
                }

                $queue[] = $child;
            }
        }

        $this->writeControllerLog(self::LOG_FILE, 'notice', 'Account not found within downline search.', ['account_id' => $accountId]);

        return null;
    }
}
