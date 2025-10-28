<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['sku' => 'P001', 'name' => 'Starter Pack', 'price' => 320],
            ['sku' => 'P002', 'name' => 'Health Supplement', 'price' => 500],
            ['sku' => 'P003', 'name' => 'Wellness Kit', 'price' => 1000],
            ['sku' => 'P004', 'name' => 'Premium Bundle', 'price' => 1500],
            ['sku' => 'P005', 'name' => 'Family Pack', 'price' => 2000],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['sku' => $p['sku']], $p);
        }
    }
}
