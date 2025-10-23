<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GenealogySeeder extends Seeder
{
    public function run(): void
    {
        $levels = 4; // Limit while testing
        $initialPair = 300;
        $decrement = 30;
        $password = Hash::make('password');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('genealogies')->truncate();
        DB::table('members_account')->truncate();
        DB::table('members_info')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Seeding genealogy tree...');

        $defaultMasterPasswordId = DB::table('master_passwords')->orderBy('id')->value('id');

        // Create root user
        $rootUserId = DB::table('users')->insertGetId([
            'name' => 'Root Node',
            'email' => 'root@binary.com',
            'password' => $password,
            'utype' => 'member',
            'master_password_id' => $defaultMasterPasswordId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create root member info
        $rootMemberId = DB::table('members_info')->insertGetId([
            'user_id' => $rootUserId,
            'email' => 'root@binary.com',
            'fname' => 'Root',
            'lname' => 'Node',
            'is_active' => true,
            'kick_start_token' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create root account
        $rootAccountId = DB::table('members_account')->insertGetId([
            'member_id' => $rootMemberId,
            'account_name' => 'ROOT_NODE',
            'dsponsor' => null,
            'under_sponsor' => null,
            'node' => 'root',
            'upper_nodes' => json_encode([]),
            'member_type' => 'root',
            'package_type' => 'standard',
            'rank_id' => null,
            'remarks' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create root genealogy node
        $rootNodeId = DB::table('genealogies')->insertGetId([
            'user_id' => $rootUserId,
            'member_id' => $rootMemberId,
            'members_account_id' => $rootAccountId,
            'parent_id' => null,
            'position' => null,
            'level' => 1,
            'pair_value' => $initialPair,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Track genealogy parents with account context
        $parents = [
            [
                'genealogy_id' => $rootNodeId,
                'account_id' => $rootAccountId,
                'member_id' => $rootMemberId,
                'upper_nodes' => [],
            ],
        ];

        // Build the tree level by level
        // for ($level = 2; $level <= $levels; $level++) {
        //     $pairValue = max(0, $initialPair - (($level - 1) * $decrement));
        //     $newParents = [];

        //     foreach ($parents as $parent) {
        //         foreach (['left', 'right'] as $pos) {
        //             $accountName = strtoupper($pos[0])."{$level}_OF_{$parent['account_id']}";
        //             $email = strtolower($pos[0])."{$level}_{$parent['account_id']}@binary.com";
        //             $fullName = "{$accountName} User";

        //             // Create user
        //             $userId = DB::table('users')->insertGetId([
        //                 'name' => $fullName,
        //                 'email' => $email,
        //                 'password' => $password,
        //                 'master_password_id' => $defaultMasterPasswordId,
        //                 'created_at' => now(),
        //                 'updated_at' => now(),
        //             ]);

        //             // Create member info
        //             $memberId = DB::table('members_info')->insertGetId([
        //                 'user_id' => $userId,
        //                 'email' => $email,
        //                 'fname' => $accountName,
        //                 'lname' => 'Member',
        //                 'is_active' => true,
        //                 'kick_start_token' => null,
        //                 'created_at' => now(),
        //                 'updated_at' => now(),
        //             ]);

        //             // Build upper node chain for this account
        //             $upperNodes = array_merge([$parent['account_id']], $parent['upper_nodes']);

        //             // Create members account
        //             $accountId = DB::table('members_account')->insertGetId([
        //                 'member_id' => $memberId,
        //                 'account_name' => $accountName,
        //                 'dsponsor' => $parent['member_id'],
        //                 'under_sponsor' => $parent['account_id'],
        //                 'node' => strtoupper($pos[0]).$level,
        //                 'upper_nodes' => json_encode($upperNodes),
        //                 'member_type' => 'member',
        //                 'package_type' => 'standard',
        //                 'rank_id' => null,
        //                 'remarks' => null,
        //                 'created_at' => now(),
        //                 'updated_at' => now(),
        //             ]);

        //             // Create genealogy node linked to parent account
        //             $nodeId = DB::table('genealogies')->insertGetId([
        //                 'user_id' => $userId,
        //                 'member_id' => $memberId,
        //                 'members_account_id' => $accountId,
        //                 'parent_id' => $parent['account_id'],
        //                 'position' => $pos,
        //                 'level' => $level,
        //                 'pair_value' => $pairValue,
        //                 'created_at' => now(),
        //                 'updated_at' => now(),
        //             ]);

        //             $newParents[] = [
        //                 'genealogy_id' => $nodeId,
        //                 'account_id' => $accountId,
        //                 'member_id' => $memberId,
        //                 'upper_nodes' => $upperNodes,
        //             ];
        //         }
        //     }

        //     $parents = $newParents;
        //     $this->command->info("Level {$level} seeded successfully.");
        // }

        $this->command->info('Genealogy tree seeding complete!');
    }
}
