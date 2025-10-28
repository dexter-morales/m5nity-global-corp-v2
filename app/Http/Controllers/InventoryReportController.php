<?php

namespace App\Http\Controllers;

use App\Exports\InventoryReportExport;
use App\Models\InventoryProduct;
use App\Services\InventoryService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class InventoryReportController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display inventory reports dashboard.
     */
    public function index(Request $request)
    {
        // Check permissions - only releasing personnel, admin, and super admin can view
        abort_unless(
            in_array(auth()->user()->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']),
            403,
            'Unauthorized access to inventory reports.'
        );

        $startDate = $request->has('start_date')
            ? Carbon::parse($request->start_date)
            : Carbon::now()->startOfMonth();

        $endDate = $request->has('end_date')
            ? Carbon::parse($request->end_date)
            : Carbon::now()->endOfMonth();

        $statistics = $this->inventoryService->getInventoryStatistics($startDate, $endDate);
        $lowStockProducts = $this->inventoryService->getLowStockProducts();
        $expiredProducts = $this->inventoryService->getExpiredProducts();
        $expiringSoonProducts = $this->inventoryService->getExpiringSoonProducts();

        $days = $request->get('days', 30);
        $fastMovingProducts = $this->inventoryService->getFastMovingProducts($days, 10);
        $slowMovingProducts = $this->inventoryService->getSlowMovingProducts($days, 10);

        // Get stock movements with filters
        $productId = $request->get('product_id');
        $stockMovements = $this->inventoryService->getStockMovements(
            $startDate,
            $endDate,
            $productId
        )->take(50);

        // Get all products for filter dropdown
        $products = InventoryProduct::active()->select('id', 'name', 'sku')->get();

        return Inertia::render('Inventory/Reports/Index', [
            'statistics' => $statistics,
            'lowStockProducts' => $lowStockProducts,
            'expiredProducts' => $expiredProducts,
            'expiringSoonProducts' => $expiringSoonProducts,
            'fastMovingProducts' => $fastMovingProducts,
            'slowMovingProducts' => $slowMovingProducts,
            'stockMovements' => $stockMovements,
            'products' => $products,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'product_id' => $productId,
                'days' => $days,
            ],
        ]);
    }

    /**
     * Export inventory report to CSV.
     */
    public function exportCsv(Request $request)
    {
        abort_unless(
            in_array(auth()->user()->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']),
            403,
            'Unauthorized access to inventory reports.'
        );

        $startDate = $request->has('start_date')
            ? Carbon::parse($request->start_date)
            : Carbon::now()->startOfMonth();

        $endDate = $request->has('end_date')
            ? Carbon::parse($request->end_date)
            : Carbon::now()->endOfMonth();

        $type = $request->get('type', 'summary');

        return Excel::download(
            new InventoryReportExport($startDate, $endDate, $type),
            "inventory-report-{$type}-".now()->format('Y-m-d').'.csv',
            \Maatwebsite\Excel\Excel::CSV
        );
    }

    /**
     * Export inventory report to Excel.
     */
    public function exportExcel(Request $request)
    {
        abort_unless(
            in_array(auth()->user()->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']),
            403,
            'Unauthorized access to inventory reports.'
        );

        $startDate = $request->has('start_date')
            ? Carbon::parse($request->start_date)
            : Carbon::now()->startOfMonth();

        $endDate = $request->has('end_date')
            ? Carbon::parse($request->end_date)
            : Carbon::now()->endOfMonth();

        $type = $request->get('type', 'summary');

        return Excel::download(
            new InventoryReportExport($startDate, $endDate, $type),
            "inventory-report-{$type}-".now()->format('Y-m-d').'.xlsx'
        );
    }

    /**
     * Export inventory report to PDF.
     */
    public function exportPdf(Request $request)
    {
        abort_unless(
            in_array(auth()->user()->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']),
            403,
            'Unauthorized access to inventory reports.'
        );

        $startDate = $request->has('start_date')
            ? Carbon::parse($request->start_date)
            : Carbon::now()->startOfMonth();

        $endDate = $request->has('end_date')
            ? Carbon::parse($request->end_date)
            : Carbon::now()->endOfMonth();

        $type = $request->get('type', 'summary');

        $data = $this->getReportData($startDate, $endDate, $type);

        $pdf = Pdf::loadView('reports.inventory', [
            'data' => $data,
            'type' => $type,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);

        return $pdf->download("inventory-report-{$type}-".now()->format('Y-m-d').'.pdf');
    }

    /**
     * Get report data based on type.
     */
    protected function getReportData(Carbon $startDate, Carbon $endDate, string $type): array
    {
        $data = [
            'statistics' => $this->inventoryService->getInventoryStatistics($startDate, $endDate),
        ];

        switch ($type) {
            case 'stock_levels':
                $data['products'] = InventoryProduct::with(['creator', 'updater'])
                    ->active()
                    ->orderBy('stock_quantity', 'asc')
                    ->get();
                break;

            case 'low_stock':
                $data['products'] = $this->inventoryService->getLowStockProducts();
                break;

            case 'expiration':
                $data['expired'] = $this->inventoryService->getExpiredProducts();
                $data['expiring_soon'] = $this->inventoryService->getExpiringSoonProducts();
                break;

            case 'fast_moving':
                $data['products'] = $this->inventoryService->getFastMovingProducts(30, 20);
                break;

            case 'slow_moving':
                $data['products'] = $this->inventoryService->getSlowMovingProducts(30, 20);
                break;

            case 'transactions':
                $data['transactions'] = $this->inventoryService->getStockMovements($startDate, $endDate);
                break;

            case 'summary':
            default:
                $data['low_stock'] = $this->inventoryService->getLowStockProducts();
                $data['expired'] = $this->inventoryService->getExpiredProducts();
                $data['expiring_soon'] = $this->inventoryService->getExpiringSoonProducts();
                $data['fast_moving'] = $this->inventoryService->getFastMovingProducts(30, 10);
                $data['slow_moving'] = $this->inventoryService->getSlowMovingProducts(30, 10);
                break;
        }

        return $data;
    }
}
