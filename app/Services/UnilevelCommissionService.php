<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Genealogy;
use App\Models\MemberAccount;
use App\Models\MemberMaintenance;
use App\Models\Purchase;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UnilevelCommissionService
{
    public function __construct(
        private readonly CompensationService $comp
    ) {
    }

    /**
     * Distribute unilevel commissions to the uplines of the buyer account.
     * Amounts are calculated from purchase total per configured level percentages.
     */
    public function distributeForPurchase(Purchase $purchase): void
    {
        $buyerAccountId = $purchase->buyer_account_id;
        $total = $purchase->total_amount;

        DB::transaction(function () use ($buyerAccountId, $total, $purchase) {
            $this->updateMaintenance($buyerAccountId, $total);

            $current = Genealogy::where('members_account_id', $buyerAccountId)->first();
            if (! $current) {
                return; // no genealogy info; cannot compute upline
            }

            $level = 1;
            $visited = 0;
            $maxLevel = $this->comp->settings()->unilevel_max_level ?? 15;

            // Follow parent chain via Genealogy.parent_id which references members_account.id
            $parentAccountId = $current->parent_id;
            while ($parentAccountId && $visited < $maxLevel) {
                $percent = $this->comp->unilevelPercentForLevel($level);
                if ($percent > 0) {
                    $amount = (int) round($total * ($percent / 100));
                    if ($amount > 0) {
                        Commission::create([
                            'member_account_id' => $parentAccountId,
                            'source' => 'unilevel',
                            'amount' => $amount,
                            'level' => $level,
                            'percent' => $percent,
                            'purchase_id' => $purchase->id,
                            'downline_account_id' => $buyerAccountId,
                            'description' => 'Unilevel income from downline purchase',
                            'trans_no' => $purchase->trans_no,
                        ]);
                    }
                }

                // Ascend to next parent
                $parentGene = Genealogy::where('members_account_id', $parentAccountId)->first();
                if (! $parentGene) {
                    break;
                }
                $parentAccountId = $parentGene->parent_id;
                $level++;
                $visited++;
            }
        });
    }

    /**
     * Update maintenance record for the buyer account; activate when threshold met.
     */
    protected function updateMaintenance(int $buyerAccountId, int $amount): void
    {
        $month = Carbon::now()->format('Y-m');
        $minimum = $this->comp->maintenanceMinimum();

        $record = MemberMaintenance::query()
            ->lockForUpdate()
            ->firstOrCreate([
                'members_account_id' => $buyerAccountId,
                'month' => $month,
            ], [
                'total_spent' => 0,
                'is_active' => false,
            ]);

        $newTotal = $record->total_spent + $amount;
        $activate = (! $record->is_active) && $newTotal >= $minimum;

        $record->total_spent = $newTotal;
        if ($activate) {
            $record->is_active = true;
            $record->activated_at = Carbon::now();
        }
        $record->save();
    }
}
