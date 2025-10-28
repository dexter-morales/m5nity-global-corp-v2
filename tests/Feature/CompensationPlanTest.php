<?php

namespace Tests\Feature;

use App\Models\Commission;
use App\Models\CompensationSetting;
use App\Models\Genealogy;
use App\Models\MemberAccount;
use App\Models\MemberInfo;
use App\Models\MemberMaintenance;
use App\Models\MemberPairingHistory;
use App\Models\MemberIncomeHistory;
use App\Models\Purchase;
use App\Models\User;
use App\Services\BinaryPairingService;
use App\Services\UnilevelCommissionService;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CompensationPlanTest extends TestCase
{
    use RefreshDatabase;

    private int $accountSequence = 1;

    protected function setUp(): void
    {
        parent::setUp();

        CompensationSetting::current();
    }

    public function test_pairing_bonuses_are_capped_at_tenth_level(): void
    {
        $root = $this->makeAccount();
        $pairing = app(BinaryPairingService::class);

        $current = $root['genealogy'];

        for ($depth = 2; $depth <= 12; $depth++) {
            $left = $this->makeAccount($current, 'left');
            $pairing->handleNewPlacement($left['account'], $left['genealogy']);

            $right = $this->makeAccount($current, 'right');
            $pairing->handleNewPlacement($right['account'], $right['genealogy']);

            $current = $left['genealogy'];
        }

        $this->assertSame(0, MemberPairingHistory::where('level', '>', 10)->count(), 'Pairing should not go beyond level 10');
        $this->assertSame(MemberPairingHistory::count(), MemberIncomeHistory::count(), 'Every pairing should create an income record');
        $this->assertSame(
            MemberPairingHistory::count(),
            MemberPairingHistory::whereBetween('level', [1, 10])->count(),
            'All recorded pairings should fall within the capped levels.'
        );
    }

    public function test_unilevel_commissions_are_capped_at_fifteenth_level(): void
    {
        Carbon::setTestNow('2025-01-01 00:00:00');

        $root = $this->makeAccount();
        $current = $root['genealogy'];

        for ($depth = 2; $depth <= 16; $depth++) {
            $child = $this->makeAccount($current, 'left');
            $current = $child['genealogy'];
        }

        $buyerAccount = MemberAccount::findOrFail($current->members_account_id);

        $cashier = User::factory()->create([
            'name' => 'POS Cashier',
            'email' => 'cashier@test.local',
            'password' => bcrypt('password'),
            'utype' => 'cashier',
        ]);

        $purchase = Purchase::create([
            'trans_no' => 'TEST-'.Str::uuid(),
            'cashier_id' => $cashier->id,
            'buyer_account_id' => $buyerAccount->id,
            'total_amount' => 1000,
            'payment_method' => 'cash',
            'paid_at' => Carbon::now(),
        ]);

        app(UnilevelCommissionService::class)->distributeForPurchase($purchase);

        $commissions = Commission::where('source', 'unilevel')->orderBy('level')->get();

        $this->assertCount(15, $commissions);
        $this->assertSame(15, $commissions->max('level'));
        $this->assertSame(0, $commissions->where('level', '>', 15)->count());

        $expected = [
            1 => 100,
            2 => 50,
            3 => 40,
            4 => 30,
            5 => 20,
        ];

        foreach ($expected as $level => $amount) {
            $this->assertSame($amount, $commissions->firstWhere('level', $level)?->amount);
        }

        foreach (range(6, 15) as $level) {
            $this->assertSame(10, $commissions->firstWhere('level', $level)?->amount);
        }

        $maintenance = MemberMaintenance::where('members_account_id', $buyerAccount->id)->first();

        $this->assertNotNull($maintenance);
        $this->assertSame(1, (int) $maintenance->is_active);
        $this->assertSame(1000, $maintenance->total_spent);

        Carbon::setTestNow();
    }

    /**
     * Helper to create a member account and its genealogy node.
     *
     * @return array{account: MemberAccount, genealogy: Genealogy}
     */
    private function makeAccount(?Genealogy $parent = null, ?string $position = null): array
    {
        $index = $this->accountSequence++;

        $user = User::factory()->create([
            'name' => "Member {$index}",
            'email' => "member{$index}@example.test",
            'password' => bcrypt('password'),
            'utype' => 'member',
        ]);

        $memberInfo = MemberInfo::create([
            'user_id' => $user->id,
            'MID' => 'MID'.str_pad((string) $index, 6, '0', STR_PAD_LEFT),
            'email' => $user->email,
            'fname' => 'Member',
            'lname' => (string) $index,
            'mobile' => '091234567'.str_pad((string) $index, 2, '0', STR_PAD_LEFT),
            'is_active' => true,
            'kick_start_token' => Str::uuid(),
        ]);

        $parentAccount = $parent ? MemberAccount::find($parent->members_account_id) : null;
        $upperNodes = $parentAccount ? (array) ($parentAccount->upper_nodes ?? []) : [];
        if ($parentAccount) {
            array_unshift($upperNodes, $parentAccount->id);
        }

        $account = MemberAccount::create([
            'member_id' => $memberInfo->id,
            'account_name' => 'ACC'.$index,
            'dsponsor' => $parentAccount?->member_id,
            'under_sponsor' => $parentAccount?->id,
            'node' => $position ? strtoupper(substr($position, 0, 1)).(($parent?->level ?? 0) + 1) : null,
            'upper_nodes' => $upperNodes,
            'member_type' => 'member',
            'is_main_account' => $parentAccount === null,
            'package_type' => 'standard',
            'rank_id' => null,
            'remarks' => null,
        ]);

        $genealogy = Genealogy::create([
            'user_id' => $user->id,
            'member_id' => $memberInfo->id,
            'members_account_id' => $account->id,
            'parent_id' => $parent?->members_account_id,
            'position' => $position,
            'level' => $parent ? $parent->level + 1 : 1,
            'pair_value' => max(0, 300 - (($parent?->level ?? 0) * 30)),
        ]);

        return [
            'account' => $account,
            'genealogy' => $genealogy,
        ];
    }
}
