<?php

namespace App\Http\Controllers\Releasing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReleasingDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Get orders that are ready for release (status: for_release)
        $ordersForRelease = \DB::table('purchases')
            ->join('members_account', 'purchases.buyer_account_id', '=', 'members_account.id')
            ->join('members_info', 'members_account.member_id', '=', 'members_info.id')
            ->where('purchases.status', 'for_release')
            ->orderBy('purchases.updated_at', 'desc')
            ->select([
                'purchases.id',
                'purchases.trans_no as order_number',
                'purchases.total_amount',
                'purchases.created_at',
                'purchases.updated_at',
                'members_account.account_name as account_id',
                'members_info.fname as first_name',
                'members_info.lname as last_name',
            ])
            ->limit(10)
            ->get();

        // Get released orders today
        $releasedToday = \DB::table('purchases')
            ->where('status', 'completed')
            ->whereDate('updated_at', today())
            ->count();

        // Get total pending for release
        $pendingReleaseCount = \DB::table('purchases')
            ->where('status', 'for_release')
            ->count();

        // Get low stock warnings
        $lowStockProducts = \DB::table('inventory_products')
            ->where('stock_quantity', '<=', \DB::raw('low_stock_threshold'))
            ->where('stock_quantity', '>', 0)
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold']);

        $outOfStockCount = \DB::table('inventory_products')
            ->where('stock_quantity', '<=', 0)
            ->count();

        return Inertia::render('Releasing/Dashboard', [
            'orders_for_release' => $ordersForRelease,
            'released_today' => $releasedToday,
            'pending_release_count' => $pendingReleaseCount,
            'inventory_warnings' => [
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_count' => $outOfStockCount,
            ],
        ]);
    }
}
