<?php

namespace App\Services;

use App\Models\Genealogy;
use App\Models\MemberAccount;
use App\Models\MemberIncomeHistory;
use App\Models\MemberPairingHistory;
use App\Models\MemberPairingQueue;
use Illuminate\Support\Facades\Log;

class BinaryPairingService
{
    private const LOG_FILE = 'BinaryPairing_logs.log';

    private const MAX_LEVEL = 10;

    private const BASE_AMOUNT = 300;

    private const DECREMENT = 30;

    public function handleNewPlacement(MemberAccount $account, Genealogy $node): void
    {
        $logger = Log::build([
            'driver' => 'single',
            'path' => storage_path('logs/'.self::LOG_FILE),
        ]);

        $currentNode = $node;
        $level = 1;

        while ($currentNode && $currentNode->parent_id && $level <= self::MAX_LEVEL) {
            $ancestorAccountId = $currentNode->parent_id;
            $ancestorAccount = MemberAccount::find($ancestorAccountId);

            if (! $ancestorAccount) {
                $logger->warning('Ancestor account missing during pairing evaluation.', [
                    'ancestor_account_id' => $ancestorAccountId,
                    'node_account_id' => $account->id,
                ]);
                break;
            }

            $side = $currentNode->position ?? null;
            if (! in_array($side, ['left', 'right'], true)) {
                $logger->warning('Unable to determine side for pairing.', [
                    'ancestor_account_id' => $ancestorAccountId,
                    'node_account_id' => $account->id,
                ]);
                break;
            }

            $queueEntry = MemberPairingQueue::where('ancestor_account_id', $ancestorAccountId)
                ->where('level', $level)
                ->where('side', $side === 'left' ? 'right' : 'left')
                ->orderBy('created_at')
                ->lockForUpdate()
                ->first();

            if ($queueEntry) {
                $pairAmount = max(
                    0,
                    self::BASE_AMOUNT - self::DECREMENT * ($level - 1)
                );

                $history = MemberPairingHistory::create([
                    'ancestor_account_id' => $ancestorAccountId,
                    'left_account_id' => $side === 'left' ? $account->id : $queueEntry->node_account_id,
                    'right_account_id' => $side === 'right' ? $account->id : $queueEntry->node_account_id,
                    'level' => $level,
                    'amount' => $pairAmount,
                    'paired_at' => now(),
                ]);

                MemberIncomeHistory::create([
                    'ancestor_account_id' => $ancestorAccountId,
                    'pairing_history_id' => $history->id,
                    'amount' => $pairAmount,
                    'source' => 'pairing',
                    'description' => sprintf(
                        'Pairing bonus level %d between accounts %d and %d',
                        $level,
                        $history->left_account_id,
                        $history->right_account_id
                    ),
                ]);

                $logger->info('Pairing completed.', [
                    'ancestor_account_id' => $ancestorAccountId,
                    'level' => $level,
                    'amount' => $pairAmount,
                    'left_account_id' => $history->left_account_id,
                    'right_account_id' => $history->right_account_id,
                ]);

                $queueEntry->delete();
            } else {
                MemberPairingQueue::create([
                    'ancestor_account_id' => $ancestorAccountId,
                    'node_account_id' => $account->id,
                    'side' => $side,
                    'level' => $level,
                ]);

                $logger->info('Queued node for future pairing.', [
                    'ancestor_account_id' => $ancestorAccountId,
                    'node_account_id' => $account->id,
                    'side' => $side,
                    'level' => $level,
                ]);
            }

            $currentNode = Genealogy::where('members_account_id', $ancestorAccountId)->first();
            $level++;
        }
    }
}
