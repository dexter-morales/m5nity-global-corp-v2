<?php

namespace Database\Seeders;

use App\Models\CompensationSetting;
use Illuminate\Database\Seeder;

class CompensationSettingsSeeder extends Seeder
{
    public function run(): void
    {
        CompensationSetting::firstOrCreate([], [
            'referral_bonus' => 500,
            'maintenance_minimum' => 320,
            'unilevel_max_level' => 15,
            'unilevel_percents' => [
                '1' => 10,
                '2' => 5,
                '3' => 4,
                '4' => 3,
                '5' => 2,
                '6' => 1,
                '7' => 1,
                '8' => 1,
                '9' => 1,
                '10' => 1,
                '11' => 1,
                '12' => 1,
                '13' => 1,
                '14' => 1,
                '15' => 1,
            ],
        ]);
    }
}
