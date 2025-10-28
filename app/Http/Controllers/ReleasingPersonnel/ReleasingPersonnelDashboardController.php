<?php

namespace App\Http\Controllers\ReleasingPersonnel;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use Inertia\Inertia;
use Inertia\Response;

class ReleasingPersonnelDashboardController extends Controller
{
    public function index(): Response
    {
        // Get inventory statistics
        $totalProducts = InventoryProduct::count();
        $lowStockProducts = InventoryProduct::lowStock()->count();
        $outOfStockProducts = InventoryProduct::where('stock_quantity', 0)->count();

        // Get recent products
        $recentProducts = InventoryProduct::latest()
            ->take(5)
            ->get(['id', 'name', 'stock_quantity', 'reorder_level', 'updated_at']);

        return Inertia::render('ReleasingPersonnel/Dashboard', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'lowStockProducts' => $lowStockProducts,
                'outOfStockProducts' => $outOfStockProducts,
            ],
            'recentProducts' => $recentProducts,
        ]);
    }
}
