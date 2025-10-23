<?php

namespace Database\Seeders;

use App\Models\MasterPassword;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MasterPasswordSeeder extends Seeder
{
    public function run(): void
    {
        // Seed a default master password if none exist
        if (! MasterPassword::query()->exists()) {
            MasterPassword::create([
                'name' => 'Default',
                'password' => Hash::make('master-1234'),
            ]);
        }
    }
}

