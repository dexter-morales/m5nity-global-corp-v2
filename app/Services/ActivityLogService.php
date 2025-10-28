<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    /**
     * Log a registration activity
     */
    public function logRegistration(int $userId, string $action, array $data): ActivityLog
    {
        return ActivityLog::logActivity(
            'registration',
            $action,
            "Member registration: {$data['email']}",
            [
                'member_email' => $data['email'] ?? null,
                'transaction_no' => $data['trans_no'] ?? null,
                'package_id' => $data['package_id'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
            ],
            $userId
        );
    }

    /**
     * Log a POS order activity
     */
    public function logPosOrder(int $userId, string $action, array $data): ActivityLog
    {
        $transNo = $data['trans_no'] ?? 'N/A';

        return ActivityLog::logActivity(
            'pos_order',
            $action,
            "POS Order {$action}: {$transNo}",
            [
                'order_id' => $data['order_id'] ?? null,
                'trans_no' => $data['trans_no'] ?? null,
                'buyer_mid' => $data['buyer_mid'] ?? null,
                'total_amount' => $data['total_amount'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
            ],
            $userId
        );
    }

    /**
     * Log a payment activity
     */
    public function logPayment(int $userId, int $orderId, string $transNo, float $amount): ActivityLog
    {
        return ActivityLog::logActivity(
            'payment',
            'mark_paid',
            "Order marked as paid: {$transNo}",
            [
                'order_id' => $orderId,
                'trans_no' => $transNo,
                'amount' => $amount,
            ],
            $userId
        );
    }

    /**
     * Log a release activity
     */
    public function logRelease(int $userId, string $type, int $recordId, string $transNo, ?string $receivedBy = null): ActivityLog
    {
        $typeLabel = $type === 'registration' ? 'Registration' : 'Order';
        $description = $receivedBy
            ? "{$typeLabel} released: {$transNo} to {$receivedBy}"
            : "{$typeLabel} released: {$transNo}";

        return ActivityLog::logActivity(
            'release',
            'mark_released',
            $description,
            [
                'type' => $type,
                'record_id' => $recordId,
                'trans_no' => $transNo,
                'received_by' => $receivedBy,
            ],
            $userId
        );
    }

    /**
     * Log a cancellation activity
     */
    public function logCancellation(int $userId, int $orderId, string $transNo): ActivityLog
    {
        return ActivityLog::logActivity(
            'cancel',
            'cancel_order',
            "Order cancelled: {$transNo}",
            [
                'order_id' => $orderId,
                'trans_no' => $transNo,
            ],
            $userId
        );
    }

    /**
     * Log a bulk operation
     */
    public function logBulkOperation(int $userId, string $operation, array $orderIds, int $count): ActivityLog
    {
        return ActivityLog::logActivity(
            'bulk_operation',
            $operation,
            "Bulk {$operation}: {$count} orders",
            [
                'operation' => $operation,
                'order_ids' => $orderIds,
                'count' => $count,
            ],
            $userId
        );
    }

    /**
     * Get recent activities for a user
     */
    public function getRecentActivities(int $userId, int $limit = 50)
    {
        return ActivityLog::byUser($userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get activities by type
     */
    public function getActivitiesByType(string $type, int $limit = 100)
    {
        return ActivityLog::ofType($type)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
