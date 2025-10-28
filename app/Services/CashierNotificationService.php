<?php

namespace App\Services;

use App\Models\Purchase;
use Illuminate\Support\Facades\Cache;

class CashierNotificationService
{
    /**
     * Get pending notifications for a cashier
     */
    public function getPendingNotifications(int $cashierId): array
    {
        $cacheKey = "cashier_notifications_{$cashierId}";

        return Cache::remember($cacheKey, 60, function () use ($cashierId) {
            $notifications = [];

            // Orders pending payment
            $forPaymentCount = Purchase::where('cashier_id', $cashierId)
                ->forPayment()
                ->count();

            if ($forPaymentCount > 0) {
                $notifications[] = [
                    'type' => 'for_payment',
                    'title' => 'Orders Awaiting Payment',
                    'message' => "{$forPaymentCount} order(s) waiting for payment confirmation",
                    'count' => $forPaymentCount,
                    'priority' => 'high',
                ];
            }

            // Orders ready for release
            $forReleaseCount = Purchase::where('cashier_id', $cashierId)
                ->forRelease()
                ->count();

            if ($forReleaseCount > 0) {
                $notifications[] = [
                    'type' => 'for_release',
                    'title' => 'Orders Ready for Release',
                    'message' => "{$forReleaseCount} order(s) ready to be released",
                    'count' => $forReleaseCount,
                    'priority' => 'medium',
                ];
            }

            // Pending orders
            $pendingCount = Purchase::where('cashier_id', $cashierId)
                ->pending()
                ->count();

            if ($pendingCount > 0) {
                $notifications[] = [
                    'type' => 'pending',
                    'title' => 'Pending Orders',
                    'message' => "{$pendingCount} order(s) need to be processed",
                    'count' => $pendingCount,
                    'priority' => 'low',
                ];
            }

            return $notifications;
        });
    }

    /**
     * Clear notifications cache for a cashier
     */
    public function clearNotificationsCache(int $cashierId): void
    {
        Cache::forget("cashier_notifications_{$cashierId}");
    }

    /**
     * Trigger notification when order status changes
     */
    public function notifyOrderStatusChange(Purchase $purchase, string $oldStatus, string $newStatus): void
    {
        // Clear cache to refresh notifications
        $this->clearNotificationsCache($purchase->cashier_id);

        // In a real application, you might send websocket events, emails, or push notifications here
        // For now, we'll just log it
        \Log::info('Order status changed', [
            'order_id' => $purchase->id,
            'trans_no' => $purchase->trans_no,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'cashier_id' => $purchase->cashier_id,
        ]);
    }
}
