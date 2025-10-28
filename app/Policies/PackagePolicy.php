<?php

namespace App\Policies;

use App\Models\Package;
use App\Models\User;

class PackagePolicy
{
    /**
     * Determine if the user can view any packages.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->utype, ['cashier', 'releasing_personnel', 'admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can view the package.
     */
    public function view(User $user, Package $package): bool
    {
        return in_array($user->utype, ['cashier', 'releasing_personnel', 'admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can create packages.
     */
    public function create(User $user): bool
    {
        // Only Admin and Super Admin can create packages
        return in_array($user->utype, ['admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can update the package.
     */
    public function update(User $user, Package $package): bool
    {
        // Only Admin and Super Admin can update packages
        return in_array($user->utype, ['admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can delete the package.
     */
    public function delete(User $user, Package $package): bool
    {
        // Only Admin and Super Admin can delete packages
        return in_array($user->utype, ['admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can restore the package.
     */
    public function restore(User $user, Package $package): bool
    {
        return in_array($user->utype, ['admin', 'super_admin', 'superadmin']);
    }

    /**
     * Determine if the user can permanently delete the package.
     */
    public function forceDelete(User $user, Package $package): bool
    {
        return in_array($user->utype, ['super_admin', 'superadmin']);
    }
}
