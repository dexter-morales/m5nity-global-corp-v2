<?php

namespace App\Services;

use App\Models\BinaryNode;
use App\Models\Genealogy;
use App\Models\Payout;
use Illuminate\Support\Facades\DB;

class BinaryService
{
    const BASE_BONUS = 300;

    const BONUS_DECREMENT = 30;

    const MAX_LEVEL = 10;

    public function registerNode(int $userId, ?int $parentId = null, ?string $position = null): BinaryNode
    {
        return DB::transaction(function () use ($userId, $parentId, $position) {
            $parent = $parentId ? BinaryNode::findOrFail($parentId) : null;
            $level = $parent ? $parent->level + 1 : 1;

            $node = BinaryNode::create([
                'user_id' => $userId,
                'parent_id' => $parentId,
                'position' => $position,
                'level' => $level,
            ]);

            // Record genealogy relationships
            $this->recordGenealogy($node, $parent);

            $this->checkForPair($parentId);

            return $node;
        });
    }

    protected function recordGenealogy(BinaryNode $node, ?BinaryNode $parent = null): void
    {
        // Every node is its own ancestor at depth 0
        Genealogy::create([
            'ancestor_id' => $node->id,
            'descendant_id' => $node->id,
            'depth' => 0,
        ]);

        if ($parent) {
            // For every ancestor of the parent, add a record for the new node
            $ancestors = Genealogy::where('descendant_id', $parent->id)->get();

            foreach ($ancestors as $ancestor) {
                Genealogy::create([
                    'ancestor_id' => $ancestor->ancestor_id,
                    'descendant_id' => $node->id,
                    'depth' => $ancestor->depth + 1,
                ]);
            }
        }
    }

    protected function checkForPair(?int $parentId): void
    {
        if (! $parentId) {
            return;
        }

        $parent = BinaryNode::with('leftChild', 'rightChild')->find($parentId);
        if ($parent && $parent->leftChild && $parent->rightChild) {
            $this->createPayout($parent);
        }
    }

    protected function createPayout(BinaryNode $node): void
    {
        $bonus = self::BASE_BONUS - (($node->level - 1) * self::BONUS_DECREMENT);
        if ($bonus <= 0) {
            return;
        }

        Payout::create([
            'user_id' => $node->user_id,
            'amount' => $bonus,
            'level' => $node->level,
            'type' => 'pair',
        ]);
    }
}
