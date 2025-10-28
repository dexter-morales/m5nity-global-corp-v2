<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Purchase;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CashierReportsController extends Controller
{
    protected PermissionService $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Display reports dashboard
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! $this->permissionService->canViewReports($user)) {
            abort(403, 'You do not have permission to view reports');
        }

        $cashierId = $user->id;
        $dateFrom = $request->input('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        // Summary statistics
        $stats = $this->getOrderStatistics($cashierId, $dateFrom, $dateTo);

        // Daily sales trend
        $dailySales = $this->getDailySales($cashierId, $dateFrom, $dateTo);

        // Payment method breakdown
        $paymentMethods = $this->getPaymentMethodBreakdown($cashierId, $dateFrom, $dateTo);

        // Recent activity log
        $recentActivities = ActivityLog::byUser($cashierId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'log_type', 'action', 'description', 'created_at'])
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'type' => $log->log_type,
                    'action' => $log->action,
                    'description' => $log->description,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Top selling products
        $topProducts = $this->getTopSellingProducts($cashierId, $dateFrom, $dateTo);

        return Inertia::render('Cashier/Reports', [
            'stats' => $stats,
            'dailySales' => $dailySales,
            'paymentMethods' => $paymentMethods,
            'recentActivities' => $recentActivities,
            'topProducts' => $topProducts,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    private function getOrderStatistics($cashierId, $dateFrom, $dateTo): array
    {
        $orders = Purchase::where('cashier_id', $cashierId)
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        return [
            'total_orders' => $orders->clone()->count(),
            'total_sales' => $orders->clone()->whereIn('status', [
                Purchase::STATUS_FOR_RELEASE,
                Purchase::STATUS_COMPLETED,
            ])->sum('total_amount'),
            'pending' => $orders->clone()->pending()->count(),
            'for_payment' => $orders->clone()->forPayment()->count(),
            'for_release' => $orders->clone()->forRelease()->count(),
            'completed' => $orders->clone()->completed()->count(),
            'cancelled' => $orders->clone()->cancelled()->count(),
        ];
    }

    private function getDailySales($cashierId, $dateFrom, $dateTo): array
    {
        return Purchase::where('cashier_id', $cashierId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->whereIn('status', [Purchase::STATUS_FOR_RELEASE, Purchase::STATUS_COMPLETED])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as sales')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'orders' => $item->orders,
                    'sales' => floatval($item->sales),
                ];
            })
            ->toArray();
    }

    private function getPaymentMethodBreakdown($cashierId, $dateFrom, $dateTo): array
    {
        return Purchase::where('cashier_id', $cashierId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->whereIn('status', [Purchase::STATUS_FOR_RELEASE, Purchase::STATUS_COMPLETED])
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => $item->payment_method,
                    'count' => $item->count,
                    'total' => floatval($item->total),
                ];
            })
            ->toArray();
    }

    private function getTopSellingProducts($cashierId, $dateFrom, $dateTo, $limit = 10): array
    {
        return DB::table('purchase_items')
            ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->join('products', 'purchase_items.product_id', '=', 'products.id')
            ->where('purchases.cashier_id', $cashierId)
            ->whereBetween('purchases.created_at', [$dateFrom, $dateTo])
            ->whereIn('purchases.status', [Purchase::STATUS_FOR_RELEASE, Purchase::STATUS_COMPLETED])
            ->select(
                'products.name',
                'products.sku',
                DB::raw('SUM(purchase_items.quantity) as total_quantity'),
                DB::raw('SUM(purchase_items.subtotal) as total_sales')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'quantity' => $item->total_quantity,
                    'sales' => floatval($item->total_sales),
                ];
            })
            ->toArray();
    }
}
