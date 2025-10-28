<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class PermissionService
{
    /**
     * Check if user can release orders
     */
    public function canReleaseOrders(User $user): bool
    {
        if ($user->utype === 'superadmin') {
            return true;
        }

        if ($user->utype === 'releasing_personnel') {
            return true;
        }

        $profile = $user->staffProfile;

        return $profile?->can_release_orders ?? false;
    }

    /**
     * Check if user can mark orders as paid
     */
    public function canMarkPaid(User $user): bool
    {
        if ($user->utype === 'superadmin') {
            return true;
        }

        if (in_array($user->utype, ['cashier', 'releasing_personnel'])) {
            $profile = $user->staffProfile;

            return $profile?->can_mark_paid ?? true;
        }

        return false;
    }

    /**
     * Check if user can cancel orders
     */
    public function canCancelOrders(User $user): bool
    {
        if ($user->utype === 'superadmin') {
            return true;
        }

        if (in_array($user->utype, ['cashier', 'releasing_personnel'])) {
            $profile = $user->staffProfile;

            return $profile?->can_cancel_orders ?? true;
        }

        return false;
    }

    /**
     * Check if user can view reports
     */
    public function canViewReports(User $user): bool
    {
        if ($user->utype === 'superadmin') {
            return true;
        }

        $profile = $user->staffProfile;

        return $profile?->can_view_reports ?? false;
    }

    /**
     * Get user permissions as array
     */
    public function getUserPermissions(User $user): array
    {
        $cacheKey = "user_permissions_{$user->id}";

        return Cache::remember($cacheKey, 300, function () use ($user) {
            return [
                'can_release_orders' => $this->canReleaseOrders($user),
                'can_mark_paid' => $this->canMarkPaid($user),
                'can_cancel_orders' => $this->canCancelOrders($user),
                'can_view_reports' => $this->canViewReports($user),
                'is_superadmin' => $user->utype === 'superadmin',
                'is_cashier' => $user->utype === 'cashier',
                'is_releasing_personnel' => $user->utype === 'releasing_personnel',
            ];
        });
    }

    /**
     * Clear user permissions cache
     */
    public function clearUserPermissionsCache(int $userId): void
    {
        Cache::forget("user_permissions_{$userId}");
    }
}
