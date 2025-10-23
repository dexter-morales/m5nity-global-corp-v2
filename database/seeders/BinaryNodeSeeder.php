<?php

namespace Database\Seeders;

use App\Models\BinaryNode;
use App\Models\User;
use Illuminate\Database\Seeder;

class BinaryNodeSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure user 1 exists
        $rootUser = User::firstOrCreate([
            'id' => 1,
        ], [
            'name' => 'Root User',
            'email' => 'root@example.com',
            'password' => bcrypt('password'),
        ]);

        // Clear existing nodes
        BinaryNode::truncate();

        // Create root node
        $root = BinaryNode::create([
            'user_id' => $rootUser->id,
            'parent_id' => null,
            'position' => null,
            'level' => 1,
        ]);

        // Recursive closure to generate children
        $createChildren = function ($parent, $level, $maxLevel, $createChildren) {
            if ($level >= $maxLevel) {
                return;
            }

            foreach (['left', 'right'] as $position) {
                $child = BinaryNode::create([
                    'user_id' => rand(2, 1000),
                    'parent_id' => $parent->id,
                    'position' => $position,
                    'level' => $level + 1,
                ]);

                $createChildren($child, $level + 1, $maxLevel, $createChildren);
            }
        };

        // Generate up to 4 levels deep
        $createChildren($root, 1, 4, $createChildren);

        $this->command->info('Binary tree seeded successfully for user_id=1');
    }
}
