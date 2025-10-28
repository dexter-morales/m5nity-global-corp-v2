<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use Illuminate\Database\Seeder;

class CompanySettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CompanySetting::firstOrCreate(
            ['id' => 1],
            [
                'company_name' => 'Infinity MLM',
                'address' => '123 Business Street',
                'city' => 'Manila',
                'state' => 'Metro Manila',
                'zip_code' => '1000',
                'country' => 'Philippines',
                'phone' => '+63 2 1234 5678',
                'email' => 'contact@infinity.test',
                'website' => 'https://infinity.test',
                'tax_id' => '123-456-789-000',
                'receipt_header' => 'Thank you for your business!',
                'receipt_footer' => 'Please keep this receipt for your records.',
            ]
        );
    }
}
