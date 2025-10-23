<?php

namespace Database\Seeders;

use App\Models\MemberAccount;
use App\Models\MemberInfo;
use App\Models\MemberPin;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SamplePinsSeeder extends Seeder
{
    public function run(): void
    {
        $rootAccount = MemberAccount::first();

        if (! $rootAccount) {
            $this->command?->warn('No member accounts found. Skipping SamplePinsSeeder.');

            return;
        }

        $existing = MemberPin::where('sponsor_id', $rootAccount->id)->count();
        $pinsNeeded = max(0, 10 - $existing);

        if ($pinsNeeded === 0) {
            $this->command?->info('Sponsor already has at least 10 pins. Nothing to seed.');

            return;
        }

        for ($i = 0; $i < $pinsNeeded; $i++) {
            $email = sprintf('sample-pin-%d-%s@demo.test', $i + 1, Str::random(5));

            $user = User::create([
                'name' => 'Pending Member '.($existing + $i + 1),
                'email' => $email,
                'password' => Hash::make('password123'),
                'utype' => 'member',
            ]);

            $memberInfo = MemberInfo::create([
                'user_id' => $user->id,
                'MID' => Str::upper(Str::random(10)),
                'email' => $email,
                'fname' => 'Pending',
                'lname' => 'Member '.($existing + $i + 1),
                'is_active' => false,
            ]);

            MemberPin::create([
                'sponsor_id' => $rootAccount->id,
                'trans_no' => 'T-'.Str::upper(Str::random(12)),
                'payment_method' => 'seed',
                'new_member_id' => $memberInfo->id,
                'member_email' => $email,
                'pin' => Str::upper(Str::random(16)),
                'status' => 'unused',
            ]);
        }

        $this->command?->info("Seeded {$pinsNeeded} registration pins for sponsor account #{$rootAccount->id}.");
    }
}
