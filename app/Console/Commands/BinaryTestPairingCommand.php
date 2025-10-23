<?php

namespace App\Console\Commands;

use App\Models\Genealogy;
use App\Models\MemberAccount;
use App\Models\MemberInfo;
use App\Models\User;
use App\Services\BinaryPairingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class BinaryTestPairingCommand extends Command
{
    protected $signature = 'binary:test-pairing {--seed : Reseed the base genealogy first}';

    protected $description = 'Seed a minimal tree and exercise the BinaryPairingService across levels.';

    public function handle(BinaryPairingService $pairing): int
    {
        if ($this->option('seed')) {
            $this->call('db:seed', ['--class' => 'Database\\Seeders\\GenealogySeeder']);
            $this->call('db:seed', ['--class' => 'Database\\Seeders\\SamplePinsSeeder']);
        }

        // Find root placement
        $root = Genealogy::orderBy('level')->first();
        if (! $root) {
            $this->error('No genealogy root found. Run with --seed or seed manually.');
            return self::FAILURE;
        }

        // Create two immediate children under root: left and right, to trigger a pairing for level 1
        DB::transaction(function () use ($root, $pairing) {
            $password = Hash::make('password123');

            foreach (['left', 'right'] as $idx => $position) {
                $u = User::create([
                    'name' => ucfirst($position).' Test',
                    'email' => $position.'-'.uniqid().'@pairing.test',
                    'password' => $password,
                    'utype' => 'member',
                ]);

                $mi = MemberInfo::create([
                    'user_id' => $u->id,
                    'MID' => strtoupper(substr($position, 0, 1)).'-'.strtoupper(uniqid()),
                    'email' => $u->email,
                    'fname' => ucfirst($position),
                    'lname' => 'Test',
                    'is_active' => true,
                ]);

                $upper = $root->account?->upper_nodes ?? [];
                if (!is_array($upper)) $upper = (array) $upper;
                array_unshift($upper, $root->members_account_id);

                $acc = MemberAccount::create([
                    'member_id' => $mi->id,
                    'account_name' => strtoupper($position).'_OF_ROOT',
                    'dsponsor' => $root->member_id,
                    'under_sponsor' => $root->members_account_id,
                    'node' => strtoupper(substr($position, 0, 1)).'2',
                    'upper_nodes' => $upper,
                    'member_type' => 'member',
                    'package_type' => 'standard',
                ]);

                $node = Genealogy::create([
                    'user_id' => $u->id,
                    'member_id' => $mi->id,
                    'members_account_id' => $acc->id,
                    'parent_id' => $root->members_account_id,
                    'position' => $position,
                    'level' => 2,
                    'pair_value' => max(0, 300 - 30),
                ]);

                // Entry triggers queueing/pairing up its ancestry
                $pairing->handleNewPlacement($acc, $node);
            }
        });

        $this->info('Pairing test executed. Check logs and pairing/income tables.');
        return self::SUCCESS;
    }
}

