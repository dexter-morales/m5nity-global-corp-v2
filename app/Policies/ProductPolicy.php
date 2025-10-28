<?php

namespace App\Policies;

use App\Models\InventoryProduct;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine if the user can view any products.
     */
    public function viewAny(User $user): bool
    {
        // Cashier can view products (read-only)
        // Releasing personnel can view products
        // Admin and Super Admin can view products
        return in_array($user->utype, ['cashier', 'releasing_personnel', 'admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can view the product.
     */
    public function view(User $user, InventoryProduct $product): bool
    {
        return in_array($user->utype, ['cashier', 'releasing_personnel', 'admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can create products.
     */
    public function create(User $user): bool
    {
        // Only Releasing Personnel, Admin, and Super Admin can create
        return in_array($user->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can update the product.
     */
    public function update(User $user, InventoryProduct $product): bool
    {
        // Only Releasing Personnel, Admin, and Super Admin can update
        return in_array($user->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can delete the product.
     */
    public function delete(User $user, InventoryProduct $product): bool
    {
        // Only Admin and Super Admin can delete
        return in_array($user->utype, ['admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can restore the product.
     */
    public function restore(User $user, InventoryProduct $product): bool
    {
        return in_array($user->utype, ['admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can permanently delete the product.
     */
    public function forceDelete(User $user, InventoryProduct $product): bool
    {
        return in_array($user->utype, ['super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can adjust stock.
     */
    public function adjustStock(User $user, InventoryProduct $product): bool
    {
        return in_array($user->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']);
    }
}
