<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Cash',
                'code' => 'CASH',
                'description' => 'Cash payment',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'GCash',
                'code' => 'GCASH',
                'description' => 'GCash mobile wallet payment',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Bank Transfer',
                'code' => 'BANK_TRANSFER',
                'description' => 'Direct bank transfer payment',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Credit Card',
                'code' => 'CREDIT_CARD',
                'description' => 'Credit card payment',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Debit Card',
                'code' => 'DEBIT_CARD',
                'description' => 'Debit card payment',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'PayMaya',
                'code' => 'PAYMAYA',
                'description' => 'PayMaya mobile wallet payment',
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($methods as $method) {
            DB::table('payment_methods')->updateOrInsert(
                ['code' => $method['code']],
                array_merge($method, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]),
            );
        }
    }
}
