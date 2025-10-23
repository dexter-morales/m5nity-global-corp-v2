<?php

namespace Database\Seeders;

use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffProfileSeeder extends Seeder
{
    public function run(): void
    {
        $defaultMasterPasswordId = DB::table('master_passwords')->orderBy('id')->value('id');

        $staffMembers = [
            [
                'user' => [
                    'name' => 'Super Admin',
                    'email' => 'superadmin@infinity.test',
                    'password' => Hash::make('password123'),
                    'utype' => 'superadmin',
                ],
                'profile' => [
                    'role' => 'superadmin',
                    'first_name' => 'Super',
                    'middle_name' => null,
                    'last_name' => 'Admin',
                    'contact_number' => '+639171111111',
                    'department' => 'Executive',
                ],
            ],
            [
                'user' => [
                    'name' => 'Admin User',
                    'email' => 'admin@infinity.test',
                    'password' => Hash::make('password123'),
                    'utype' => 'admin',
                ],
                'profile' => [
                    'role' => 'admin',
                    'first_name' => 'Admin',
                    'middle_name' => null,
                    'last_name' => 'User',
                    'contact_number' => '+639172222222',
                    'department' => 'Operations',
                ],
            ],
            [
                'user' => [
                    'name' => 'Accounting Lead',
                    'email' => 'accounting@infinity.test',
                    'password' => Hash::make('password123'),
                    'utype' => 'accounting',
                ],
                'profile' => [
                    'role' => 'accounting',
                    'first_name' => 'Accounting',
                    'middle_name' => null,
                    'last_name' => 'Lead',
                    'contact_number' => '+639173333333',
                    'department' => 'Finance',
                ],
            ],
            [
                'user' => [
                    'name' => 'Cashier User',
                    'email' => 'cashier@infinity.test',
                    'password' => Hash::make('password123'),
                    'utype' => 'cashier',
                ],
                'profile' => [
                    'role' => 'cashier',
                    'first_name' => 'Cashier',
                    'middle_name' => null,
                    'last_name' => 'User',
                    'contact_number' => '+639174444444',
                    'department' => 'Sales',
                ],
            ],
        ];

        foreach ($staffMembers as $entry) {
            $userData = [
                ...$entry['user'],
                'master_password_id' => $defaultMasterPasswordId,
            ];

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            StaffProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    ...$entry['profile'],
                    'user_id' => $user->id,
                ]
            );
        }
    }
}
