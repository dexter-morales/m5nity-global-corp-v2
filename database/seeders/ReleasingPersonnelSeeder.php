<?php

namespace Database\Seeders;

use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ReleasingPersonnelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if releasing personnel user already exists
        $existingUser = User::where('email', 'releasing@infinity.test')->first();

        if ($existingUser) {
            $this->command->info('Releasing Personnel user already exists!');
            $this->command->info('Email: releasing@example.com');
            $this->command->info('Password: password123');

            return;
        }

        // Create releasing personnel user
        $user = User::create([
            'name' => 'Releasing Personnel',
            'email' => 'releasing@example.com',
            'password' => Hash::make('password'),
            'utype' => 'releasing_personnel',
            'email_verified_at' => now(),
        ]);

        // Create staff profile for releasing personnel
        StaffProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Releasing',
            'middle_name' => null,
            'last_name' => 'Personnel',
            'role' => 'Releasing Personnel',
            'department' => 'Operations',
            'contact_number' => '09171234567',
        ]);

        $this->command->info('Releasing Personnel user created successfully!');
        $this->command->info('Email: releasing@example.com');
        $this->command->info('Password: password');
    }
}
