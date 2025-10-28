<?php

namespace Database\Seeders;

use App\Models\InventoryProduct;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a super admin user for created_by
        $admin = User::where('utype', 'super_admin')->first() ?? User::where('utype', 'admin')->first();

        // Create sample products
        $products = [
            [
                'name' => 'Premium Wellness Supplement',
                'sku' => 'PROD-001',
                'description' => 'High-quality wellness supplement with essential vitamins',
                'price' => 500.00,
                'stock_quantity' => 100,
                'reorder_level' => 20,
                'expiration_date' => now()->addMonths(12),
                'status' => 'active',
                'created_by' => $admin?->id,
                'updated_by' => $admin?->id,
            ],
            [
                'name' => 'Energy Booster Pack',
                'sku' => 'PROD-002',
                'description' => 'Natural energy booster for daily vitality',
                'price' => 350.00,
                'stock_quantity' => 150,
                'reorder_level' => 30,
                'expiration_date' => now()->addMonths(18),
                'status' => 'active',
                'created_by' => $admin?->id,
                'updated_by' => $admin?->id,
            ],
            [
                'name' => 'Immune Support Tablets',
                'sku' => 'PROD-003',
                'description' => 'Boost your immune system naturally',
                'price' => 450.00,
                'stock_quantity' => 75,
                'reorder_level' => 15,
                'expiration_date' => now()->addMonths(24),
                'status' => 'active',
                'created_by' => $admin?->id,
                'updated_by' => $admin?->id,
            ],
            [
                'name' => 'Detox Tea Blend',
                'sku' => 'PROD-004',
                'description' => 'Organic detox tea for cleansing',
                'price' => 250.00,
                'stock_quantity' => 200,
                'reorder_level' => 40,
                'expiration_date' => now()->addMonths(6),
                'status' => 'active',
                'created_by' => $admin?->id,
                'updated_by' => $admin?->id,
            ],
            [
                'name' => 'Protein Shake Mix',
                'sku' => 'PROD-005',
                'description' => 'High-protein shake for muscle building',
                'price' => 800.00,
                'stock_quantity' => 50,
                'reorder_level' => 10,
                'expiration_date' => now()->addMonths(9),
                'status' => 'active',
                'created_by' => $admin?->id,
                'updated_by' => $admin?->id,
            ],
        ];

        foreach ($products as $productData) {
            InventoryProduct::create($productData);
        }

        // Create the default "Standard" package
        $standardPackage = Package::create([
            'name' => 'Standard Package',
            'code' => 'PKG-STANDARD',
            'description' => 'Default starter package with essential products',
            'price' => 4000.00,
            'status' => 'active',
            'created_by' => $admin?->id,
            'updated_by' => $admin?->id,
        ]);

        // Attach products to the Standard package
        $product1 = InventoryProduct::where('sku', 'PROD-001')->first();
        $product2 = InventoryProduct::where('sku', 'PROD-002')->first();
        $product3 = InventoryProduct::where('sku', 'PROD-003')->first();

        if ($product1 && $product2 && $product3) {
            $standardPackage->products()->attach([
                $product1->id => ['quantity' => 2],
                $product2->id => ['quantity' => 3],
                $product3->id => ['quantity' => 2],
            ]);
        }

        // Create additional packages
        $premiumPackage = Package::create([
            'name' => 'Premium Package',
            'code' => 'PKG-PREMIUM',
            'description' => 'Premium package with advanced wellness products',
            'price' => 7500.00,
            'status' => 'active',
            'created_by' => $admin?->id,
            'updated_by' => $admin?->id,
        ]);

        $product4 = InventoryProduct::where('sku', 'PROD-004')->first();
        $product5 = InventoryProduct::where('sku', 'PROD-005')->first();

        if ($product1 && $product2 && $product3 && $product5) {
            $premiumPackage->products()->attach([
                $product1->id => ['quantity' => 3],
                $product2->id => ['quantity' => 5],
                $product3->id => ['quantity' => 3],
                $product5->id => ['quantity' => 2],
            ]);
        }

        $this->command->info('Inventory seeded successfully!');
        $this->command->info('');
        $this->command->info('Default Package Details:');
        $this->command->info('- Standard Package: ₱4,000.00');
        $this->command->info('- Premium Package: ₱7,500.00');
    }
}
