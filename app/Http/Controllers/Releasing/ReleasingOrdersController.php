<?php

namespace App\Http\Controllers\Releasing;

use App\Events\OrderStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Services\ActivityLogService;
use App\Services\CashierNotificationService;
use App\Services\PermissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ReleasingOrdersController extends Controller
{
    protected PermissionService $permissionService;

    protected ActivityLogService $activityLog;

    protected CashierNotificationService $notificationService;

    public function __construct(
        PermissionService $permissionService,
        ActivityLogService $activityLog,
        CashierNotificationService $notificationService
    ) {
        $this->permissionService = $permissionService;
        $this->activityLog = $activityLog;
        $this->notificationService = $notificationService;
    }

    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $tab = $request->query('tab', 'for_release');
        $perPage = 15;

        // Helper function to apply search filter
        $applySearch = function ($query) use ($search) {
            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('trans_no', 'like', "%{$search}%")
                        ->orWhere('received_by', 'like', "%{$search}%")
                        ->orWhereHas('buyerAccount.memberInfo', function ($memberQuery) use ($search) {
                            $memberQuery->where('fname', 'like', "%{$search}%")
                                ->orWhere('lname', 'like', "%{$search}%")
                                ->orWhere('MID', 'like', "%{$search}%");
                        })
                        ->orWhereHas('buyerAccount', function ($accountQuery) use ($search) {
                            $accountQuery->where('account_name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('items.product', function ($productQuery) use ($search) {
                            $productQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('sku', 'like', "%{$search}%");
                        });
                });
            }
        };

        // Helper function to apply sorting
        $applySort = function ($query) use ($sort, $direction) {
            if ($sort === 'member_name') {
                // Sort by member's first name - use correct table and column names
                $query->join('members_account', 'purchases.buyer_account_id', '=', 'members_account.id')
                    ->leftJoin('members_info', 'members_account.member_id', '=', 'members_info.id')
                    ->orderBy('members_info.fname', $direction)
                    ->select('purchases.*');
            } elseif ($sort === 'released_at') {
                $query->orderBy('released_at', $direction);
            } else {
                $query->orderBy($sort, $direction);
            }
        };

        // Helper function to transform orders
        $transformOrder = function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->trans_no,
                'member_account_id' => $order->buyer_account_id,
                'account_id' => $order->buyerAccount->account_name ?? 'N/A',
                'member_name' => $order->buyerAccount && $order->buyerAccount->memberInfo
                    ? $order->buyerAccount->memberInfo->fname.' '.$order->buyerAccount->memberInfo->lname
                    : 'Unknown Member',
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                'released_at' => $order->released_at,
                'received_by' => $order->received_by,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name ?? 'Unknown Product',
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                    ];
                }),
            ];
        };

        // Get orders that are ready for release (status: for_release)
        $forReleaseQuery = Purchase::with(['buyerAccount.memberInfo', 'items.product'])
            ->where('status', 'for_release');
        $applySearch($forReleaseQuery);
        $applySort($forReleaseQuery);
        $forReleaseOrders = $forReleaseQuery->paginate($perPage, ['*'], 'for_release_page')
            ->withQueryString();

        // Transform the paginated data
        $forReleaseOrders->getCollection()->transform($transformOrder);

        // Get completed orders
        $completedQuery = Purchase::with(['buyerAccount.memberInfo', 'items.product'])
            ->where('status', 'completed')
            ->whereNotNull('released_at');
        $applySearch($completedQuery);
        // For completed orders, default sort by released_at if not specified
        if ($sort === 'created_at') {
            $completedQuery->orderBy('released_at', 'desc');
        } else {
            $applySort($completedQuery);
        }
        $completedOrders = $completedQuery->paginate($perPage, ['*'], 'completed_page')
            ->withQueryString();

        // Transform the paginated data
        $completedOrders->getCollection()->transform($transformOrder);

        return Inertia::render('Releasing/Orders', [
            'for_release_orders' => $forReleaseOrders,
            'completed_orders' => $completedOrders,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'tab' => $tab,
            ],
        ]);
    }

    /**
     * Mark order as released (for releasing personnel)
     */
    public function markAsReleased(Request $request, $id): RedirectResponse
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

            Log::info('Order released by releasing personnel', ['order_id' => $id, 'received_by' => $validated['received_by'], 'user_id' => Auth::id()]);

            return redirect()->back();
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        } catch (\Exception $e) {
            Log::error('Failed to release order', [
                'order_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Failed to release order']);
        }
    }

    /**
     * Bulk mark orders as released (for releasing personnel)
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

            DB::transaction(function () use ($validated, &$successCount, &$failedOrders) {
                foreach ($validated['order_ids'] as $orderId) {
                    try {
                        $order = Purchase::findOrFail($orderId);

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
            Log::error('Bulk release failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json(['message' => 'Bulk operation failed'], 500);
        }
    }
}
