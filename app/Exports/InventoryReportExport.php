<?php

namespace App\Exports;

use App\Services\InventoryService;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class InventoryReportExport implements WithMultipleSheets
{
    protected $startDate;

    protected $endDate;

    protected $type;

    public function __construct(Carbon $startDate, Carbon $endDate, string $type = 'summary')
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->type = $type;
    }

    /**
     * Get sheets for the export.
     */
    public function sheets(): array
    {
        $sheets = [];

        switch ($this->type) {
            case 'summary':
                $sheets[] = new SummarySheet($this->startDate, $this->endDate);
                $sheets[] = new LowStockSheet($this->startDate, $this->endDate);
                $sheets[] = new ExpirationSheet($this->startDate, $this->endDate);
                $sheets[] = new FastMovingSheet($this->startDate, $this->endDate);
                $sheets[] = new SlowMovingSheet($this->startDate, $this->endDate);
                break;

            case 'stock_levels':
                $sheets[] = new StockLevelsSheet($this->startDate, $this->endDate);
                break;

            case 'low_stock':
                $sheets[] = new LowStockSheet($this->startDate, $this->endDate);
                break;

            case 'expiration':
                $sheets[] = new ExpirationSheet($this->startDate, $this->endDate);
                break;

            case 'fast_moving':
                $sheets[] = new FastMovingSheet($this->startDate, $this->endDate);
                break;

            case 'slow_moving':
                $sheets[] = new SlowMovingSheet($this->startDate, $this->endDate);
                break;

            case 'transactions':
                $sheets[] = new TransactionsSheet($this->startDate, $this->endDate);
                break;

            default:
                $sheets[] = new SummarySheet($this->startDate, $this->endDate);
                break;
        }

        return $sheets;
    }
}

class SummarySheet implements FromCollection, ShouldAutoSize, WithHeadings, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct(Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $service = app(InventoryService::class);
        $stats = $service->getInventoryStatistics($this->startDate, $this->endDate);

        return collect([
            ['Metric', 'Value'],
            ['Report Period', $this->startDate->format('Y-m-d').' to '.$this->endDate->format('Y-m-d')],
            ['Total Products', $stats['total_products']],
            ['Total Stock Value', '₱ '.number_format($stats['total_stock_value'], 2)],
            ['Low Stock Products', $stats['low_stock_count']],
            ['Expired Products', $stats['expired_count']],
            ['Expiring Soon', $stats['expiring_soon_count']],
            ['Stock In (Period)', $stats['stock_in_count']],
            ['Stock Out (Period)', $stats['stock_out_count']],
            ['Net Stock Change', $stats['net_stock_change']],
        ]);
    }

    public function headings(): array
    {
        return [];
    }

    public function title(): string
    {
        return 'Summary';
    }
}

class StockLevelsSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct(Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return \App\Models\Product::with(['creator', 'updater'])
            ->active()
            ->orderBy('stock_quantity', 'asc')
            ->get();
    }

    public function map($product): array
    {
        return [
            $product->sku,
            $product->name,
            $product->stock_quantity,
            $product->reorder_level,
            '₱ '.number_format($product->price, 2),
            '₱ '.number_format($product->stock_quantity * $product->price, 2),
            $product->status,
            $product->expiration_date?->format('Y-m-d') ?? 'N/A',
        ];
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Product Name',
            'Stock Quantity',
            'Reorder Level',
            'Unit Price',
            'Total Value',
            'Status',
            'Expiration Date',
        ];
    }

    public function title(): string
    {
        return 'Stock Levels';
    }
}

class LowStockSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct(Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return app(InventoryService::class)->getLowStockProducts();
    }

    public function map($product): array
    {
        return [
            $product->sku,
            $product->name,
            $product->stock_quantity,
            $product->reorder_level,
            $product->reorder_level - $product->stock_quantity,
            '₱ '.number_format($product->price, 2),
        ];
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Product Name',
            'Current Stock',
            'Reorder Level',
            'Shortage',
            'Unit Price',
        ];
    }

    public function title(): string
    {
        return 'Low Stock';
    }
}

class ExpirationSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct(Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $service = app(InventoryService::class);
        $expired = $service->getExpiredProducts();
        $expiringSoon = $service->getExpiringSoonProducts();

        return $expired->merge($expiringSoon)->sortBy('expiration_date');
    }

    public function map($product): array
    {
        $status = $product->is_expired ? 'Expired' : 'Expiring Soon';
        $daysUntilExpiry = $product->expiration_date ? $product->expiration_date->diffInDays(now(), false) : null;

        return [
            $product->sku,
            $product->name,
            $product->stock_quantity,
            $product->expiration_date?->format('Y-m-d') ?? 'N/A',
            $status,
            $daysUntilExpiry ? abs($daysUntilExpiry).' days' : 'N/A',
        ];
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Product Name',
            'Stock Quantity',
            'Expiration Date',
            'Status',
            'Days Until/Since Expiry',
        ];
    }

    public function title(): string
    {
        return 'Expiration Report';
    }
}

class FastMovingSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct(Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return app(InventoryService::class)->getFastMovingProducts(30, 50);
    }

    public function map($product): array
    {
        return [
            $product->sku,
            $product->name,
            $product->stock_quantity,
            $product->total_moved ?? 0,
            '₱ '.number_format($product->price, 2),
        ];
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Product Name',
            'Current Stock',
            'Units Sold (30 days)',
            'Unit Price',
        ];
    }

    public function title(): string
    {
        return 'Fast Moving Products';
    }
}

class SlowMovingSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct(Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return app(InventoryService::class)->getSlowMovingProducts(30, 50);
    }

    public function map($product): array
    {
        return [
            $product->sku,
            $product->name,
            $product->stock_quantity,
            $product->total_moved ?? 0,
            '₱ '.number_format($product->price, 2),
        ];
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Product Name',
            'Current Stock',
            'Units Sold (30 days)',
            'Unit Price',
        ];
    }

    public function title(): string
    {
        return 'Slow Moving Products';
    }
}

class TransactionsSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct(Carbon $startDate, Carbon $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return app(InventoryService::class)->getStockMovements($this->startDate, $this->endDate);
    }

    public function map($transaction): array
    {
        return [
            $transaction->created_at->format('Y-m-d H:i:s'),
            $transaction->product->sku ?? 'N/A',
            $transaction->product->name ?? 'N/A',
            strtoupper($transaction->type),
            $transaction->quantity,
            $transaction->previous_quantity,
            $transaction->new_quantity,
            $transaction->notes ?? '',
            $transaction->creator->name ?? 'System',
        ];
    }

    public function headings(): array
    {
        return [
            'Date/Time',
            'SKU',
            'Product Name',
            'Type',
            'Quantity',
            'Previous Stock',
            'New Stock',
            'Notes',
            'Created By',
        ];
    }

    public function title(): string
    {
        return 'Transactions';
    }
}
