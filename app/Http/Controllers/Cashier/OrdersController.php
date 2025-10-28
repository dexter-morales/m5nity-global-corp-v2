<?php

namespace App\Http\Controllers\Cashier;

use App\Events\OrderStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Services\ActivityLogService;
use App\Services\CashierNotificationService;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrdersController extends Controller
{
    private const LOG_FILE = 'CashierOrders_logs.log';

    protected ActivityLogService $activityLog;

    protected CashierNotificationService $notificationService;

    protected PermissionService $permissionService;

    public function __construct(
        ActivityLogService $activityLog,
        CashierNotificationService $notificationService,
        PermissionService $permissionService
    ) {
        $this->activityLog = $activityLog;
        $this->notificationService = $notificationService;
        $this->permissionService = $permissionService;
    }

    /**
     * Move order to 'for_payment' status
     */
    public function moveToPayment(Request $request, $id)
    {
        try {
            $order = Purchase::findOrFail($id);

            // Verify cashier owns this order
            if ($order->cashier_id !== Auth::id()) {
                return redirect()->back()->withErrors(['message' => 'Unauthorized']);
            }

            if ($order->status !== Purchase::STATUS_PENDING) {
                return redirect()->back()->withErrors(['message' => 'Order must be in pending status']);
            }

            $oldStatus = $order->status;
            $order->update(['status' => Purchase::STATUS_FOR_PAYMENT]);

            // Log activity
            $this->activityLog->logPosOrder(Auth::id(), 'move_to_payment', [
                'order_id' => $order->id,
                'trans_no' => $order->trans_no,
                'buyer_mid' => $order->buyerAccount?->memberInfo?->MID,
                'total_amount' => $order->total_amount,
            ]);

            // Notify status change
            $this->notificationService->notifyOrderStatusChange($order, $oldStatus, $order->status);

            // Broadcast real-time event
            broadcast(new OrderStatusChanged($order, $oldStatus, $order->status));

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Order moved to for_payment', ['order_id' => $id]);

            return redirect()->back();
        } catch (\Exception $e) {
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to move order to payment', [
                'order_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Failed to update order status']);
        }
    }

    /**
     * Mark order as paid
     */
    public function markAsPaid(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'payment_method' => 'nullable|string|max:100',
            ]);

            $order = Purchase::findOrFail($id);
            $user = Auth::user();

            // Check permissions
            if (! $this->permissionService->canMarkPaid($user)) {
                return redirect()->back()->withErrors(['message' => 'You do not have permission to mark orders as paid']);
            }

            if ($order->cashier_id !== Auth::id()) {
                return redirect()->back()->withErrors(['message' => 'Unauthorized']);
            }

            if (! in_array($order->status, [Purchase::STATUS_PENDING, Purchase::STATUS_FOR_PAYMENT])) {
                return redirect()->back()->withErrors(['message' => 'Order cannot be marked as paid from current status']);
            }

            $oldStatus = $order->status;
            $updateData = [
                'status' => Purchase::STATUS_FOR_RELEASE,
                'paid_at' => now(),
            ];

            if (isset($validated['payment_method'])) {
                $updateData['payment_method'] = $validated['payment_method'];
            }

            $order->update($updateData);

            // Log activity
            $this->activityLog->logPayment(Auth::id(), $order->id, $order->trans_no, $order->total_amount);

            // Notify status change
            $this->notificationService->notifyOrderStatusChange($order, $oldStatus, $order->status);

            // Broadcast real-time event
            broadcast(new OrderStatusChanged($order, $oldStatus, $order->status));

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Order marked as paid', ['order_id' => $id]);

            return redirect()->back();
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        } catch (\Exception $e) {
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to mark order as paid', [
                'order_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Failed to mark order as paid']);
        }
    }

    /**
     * Mark order as released
     */
    public function markAsReleased(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'received_by' => 'required|string|max:255',
            ]);

            $order = Purchase::findOrFail($id);
            $user = Auth::user();

            // Check permissions
            if (! $this->permissionService->canReleaseOrders($user)) {
                return redirect()->back()->withErrors(['message' => 'You do not have permission to release orders']);
            }

            // Only cashiers need to release their own orders
            // Releasing personnel can release any order
            if ($user->utype === 'cashier' && $order->cashier_id !== Auth::id()) {
                return redirect()->back()->withErrors(['message' => 'Unauthorized - You can only release your own orders']);
            }

            if ($order->status !== Purchase::STATUS_FOR_RELEASE) {
                return redirect()->back()->withErrors(['message' => 'Order must be in for_release status']);
            }

            $oldStatus = $order->status;
            $order->update([
                'status' => Purchase::STATUS_COMPLETED,
                'received_by' => $validated['received_by'],
                'released_at' => now(),
            ]);

            // Log activity
            $this->activityLog->logRelease(Auth::id(), 'order', $order->id, $order->trans_no, $validated['received_by']);

            // Notify status change
            $this->notificationService->notifyOrderStatusChange($order, $oldStatus, $order->status);

            // Broadcast real-time event
            broadcast(new OrderStatusChanged($order, $oldStatus, $order->status));

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Order released', ['order_id' => $id, 'received_by' => $validated['received_by']]);

            return redirect()->back();
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        } catch (\Exception $e) {
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to release order', [
                'order_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Failed to release order']);
        }
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, $id)
    {
        try {
            $order = Purchase::findOrFail($id);
            $user = Auth::user();

            // Check permissions
            if (! $this->permissionService->canCancelOrders($user)) {
                return redirect()->back()->withErrors(['message' => 'You do not have permission to cancel orders']);
            }

            if ($order->cashier_id !== Auth::id()) {
                return redirect()->back()->withErrors(['message' => 'Unauthorized']);
            }

            if (in_array($order->status, [Purchase::STATUS_COMPLETED, Purchase::STATUS_CANCELLED])) {
                return redirect()->back()->withErrors(['message' => 'Cannot cancel order in current status']);
            }

            $oldStatus = $order->status;
            $order->update(['status' => Purchase::STATUS_CANCELLED]);

            // Log activity
            $this->activityLog->logCancellation(Auth::id(), $order->id, $order->trans_no);

            // Notify status change
            $this->notificationService->notifyOrderStatusChange($order, $oldStatus, $order->status);

            // Broadcast real-time event
            broadcast(new OrderStatusChanged($order, $oldStatus, $order->status));

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Order cancelled', ['order_id' => $id]);

            return redirect()->back();
        } catch (\Exception $e) {
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Failed to cancel order', [
                'order_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Failed to cancel order']);
        }
    }

    /**
     * Get order details for receipt printing
     */
    public function show($id)
    {
        $order = Purchase::with(['buyerAccount.memberInfo', 'items.product'])
            ->findOrFail($id);

        if ($order->cashier_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $acc = $order->buyerAccount;
        $member = $acc?->memberInfo;
        $memberName = $member ? trim(($member->fname ?? '').' '.($member->lname ?? '')) : $acc?->account_name;

        return response()->json([
            'id' => $order->id,
            'trans_no' => $order->trans_no,
            'member_name' => $memberName,
            'buyer_mid' => $member?->MID ?? 'N/A',
            'buyer_email' => $member?->email ?? 'N/A',
            'buyer_phone' => $member?->contact_no ?? 'N/A',
            'total_amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'date' => optional($order->created_at)->format('Y-m-d H:i:s'),
            'paid_at' => optional($order->paid_at)->format('Y-m-d H:i:s'),
            'released_at' => optional($order->released_at)->format('Y-m-d H:i:s'),
            'received_by' => $order->received_by,
            'status' => $order->status,
            'source' => $order->source,
            'items' => $order->items->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product?->name ?? 'N/A',
                    'product_sku' => $item->product?->sku ?? 'N/A',
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ];
            }),
        ]);
    }

    /**
     * Bulk mark orders as paid
     */
    public function bulkMarkAsPaid(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_ids' => 'required|array|min:1|max:50',
                'order_ids.*' => 'required|integer|exists:purchases,id',
            ]);

            $user = Auth::user();

            if (! $this->permissionService->canMarkPaid($user)) {
                return response()->json(['message' => 'You do not have permission to mark orders as paid'], 403);
            }

            $successCount = 0;
            $failedOrders = [];

            DB::transaction(function () use ($validated, &$successCount, &$failedOrders) {
                foreach ($validated['order_ids'] as $orderId) {
                    try {
                        $order = Purchase::findOrFail($orderId);

                        if ($order->cashier_id !== Auth::id()) {
                            $failedOrders[] = ['id' => $orderId, 'reason' => 'Unauthorized'];

                            continue;
                        }

                        if (! in_array($order->status, [Purchase::STATUS_PENDING, Purchase::STATUS_FOR_PAYMENT])) {
                            $failedOrders[] = ['id' => $orderId, 'reason' => 'Invalid status'];

                            continue;
                        }

                        $oldStatus = $order->status;
                        $order->update([
                            'status' => Purchase::STATUS_FOR_RELEASE,
                            'paid_at' => now(),
                        ]);

                        $this->notificationService->notifyOrderStatusChange($order, $oldStatus, $order->status);
                        $successCount++;
                    } catch (\Exception $e) {
                        $failedOrders[] = ['id' => $orderId, 'reason' => $e->getMessage()];
                    }
                }

                // Log bulk operation
                $this->activityLog->logBulkOperation(Auth::id(), 'bulk_mark_paid', $validated['order_ids'], $successCount);
            });

            return response()->json([
                'message' => "Successfully marked {$successCount} order(s) as paid",
                'success_count' => $successCount,
                'failed_orders' => $failedOrders,
            ]);
        } catch (\Exception $e) {
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Bulk mark as paid failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Bulk operation failed'], 500);
        }
    }

    /**
     * Bulk mark orders as released
     */
    public function bulkMarkAsReleased(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_ids' => 'required|array|min:1|max:50',
                'order_ids.*' => 'required|integer|exists:purchases,id',
                'received_by' => 'required|string|max:255',
            ]);

            $user = Auth::user();

            if (! $this->permissionService->canReleaseOrders($user)) {
                return response()->json(['message' => 'You do not have permission to release orders'], 403);
            }

            $successCount = 0;
            $failedOrders = [];

            DB::transaction(function () use ($validated, &$successCount, &$failedOrders, $user) {
                foreach ($validated['order_ids'] as $orderId) {
                    try {
                        $order = Purchase::findOrFail($orderId);

                        // Only cashiers need to release their own orders
                        // Releasing personnel can release any order
                        if ($user->utype === 'cashier' && $order->cashier_id !== Auth::id()) {
                            $failedOrders[] = ['id' => $orderId, 'reason' => 'Unauthorized - Cashiers can only release their own orders'];

                            continue;
                        }

                        if ($order->status !== Purchase::STATUS_FOR_RELEASE) {
                            $failedOrders[] = ['id' => $orderId, 'reason' => 'Order must be in for_release status'];

                            continue;
                        }

                        $oldStatus = $order->status;
                        $order->update([
                            'status' => Purchase::STATUS_COMPLETED,
                            'received_by' => $validated['received_by'],
                            'released_at' => now(),
                        ]);

                        $this->notificationService->notifyOrderStatusChange($order, $oldStatus, $order->status);
                        $successCount++;
                    } catch (\Exception $e) {
                        $failedOrders[] = ['id' => $orderId, 'reason' => $e->getMessage()];
                    }
                }

                // Log bulk operation
                $this->activityLog->logBulkOperation(Auth::id(), 'bulk_release', $validated['order_ids'], $successCount);
            });

            return response()->json([
                'message' => "Successfully released {$successCount} order(s)",
                'success_count' => $successCount,
                'failed_orders' => $failedOrders,
            ]);
        } catch (\Exception $e) {
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Bulk release failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Bulk release failed'], 500);
        }
    }

    /**
     * Bulk cancel orders
     */
    public function bulkCancel(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_ids' => 'required|array|min:1|max:50',
                'order_ids.*' => 'required|integer|exists:purchases,id',
            ]);

            $user = Auth::user();

            if (! $this->permissionService->canCancelOrders($user)) {
                return response()->json(['message' => 'You do not have permission to cancel orders'], 403);
            }

            $successCount = 0;
            $failedOrders = [];

            DB::transaction(function () use ($validated, &$successCount, &$failedOrders) {
                foreach ($validated['order_ids'] as $orderId) {
                    try {
                        $order = Purchase::findOrFail($orderId);

                        if ($order->cashier_id !== Auth::id()) {
                            $failedOrders[] = ['id' => $orderId, 'reason' => 'Unauthorized'];

                            continue;
                        }

                        if (in_array($order->status, [Purchase::STATUS_COMPLETED, Purchase::STATUS_CANCELLED])) {
                            $failedOrders[] = ['id' => $orderId, 'reason' => 'Cannot cancel order in current status'];

                            continue;
                        }

                        $oldStatus = $order->status;
                        $order->update(['status' => Purchase::STATUS_CANCELLED]);

                        $this->notificationService->notifyOrderStatusChange($order, $oldStatus, $order->status);
                        $successCount++;
                    } catch (\Exception $e) {
                        $failedOrders[] = ['id' => $orderId, 'reason' => $e->getMessage()];
                    }
                }

                // Log bulk operation
                $this->activityLog->logBulkOperation(Auth::id(), 'bulk_cancel', $validated['order_ids'], $successCount);
            });

            return response()->json([
                'message' => "Successfully cancelled {$successCount} order(s)",
                'success_count' => $successCount,
                'failed_orders' => $failedOrders,
            ]);
        } catch (\Exception $e) {
            $this->writeControllerLog(self::LOG_FILE, 'error', 'Bulk cancel failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Bulk cancel failed'], 500);
        }
    }
}
