<?php

namespace App\Services;

use App\Models\InventoryProduct;
use App\Models\InventoryTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Record a stock transaction.
     */
    public function recordTransaction(
        Product $product,
        string $type,
        int $quantity,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $notes = null,
        ?int $userId = null
    ): InventoryTransaction {
        return DB::transaction(function () use ($product, $type, $quantity, $referenceType, $referenceId, $notes, $userId) {
            $previousQuantity = $product->stock_quantity;

            // Calculate new quantity based on transaction type
            $newQuantity = match ($type) {
                'in' => $previousQuantity + $quantity,
                'out' => max(0, $previousQuantity - $quantity),
                'adjustment' => $quantity, // Direct set for adjustments
                default => $previousQuantity,
            };

            // Create transaction record
            $transaction = InventoryTransaction::create([
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => $quantity,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $newQuantity,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
                'created_by' => $userId ?? auth()->id(),
            ]);

            // Update product stock
            $product->update([
                'stock_quantity' => $newQuantity,
                'updated_by' => $userId ?? auth()->id(),
            ]);

            return $transaction;
        });
    }

    /**
     * Get low stock products.
     */
    public function getLowStockProducts()
    {
        return InventoryProduct::lowStock()
            ->active()
            ->with(['creator', 'updater'])
            ->orderBy('stock_quantity', 'asc')
            ->get();
    }

    /**
     * Get expired products.
     */
    public function getExpiredProducts()
    {
        return InventoryProduct::expired()
            ->with(['creator', 'updater'])
            ->orderBy('expiration_date', 'asc')
            ->get();
    }

    /**
     * Get expiring soon products.
     */
    public function getExpiringSoonProducts()
    {
        return InventoryProduct::expiringSoon()
            ->with(['creator', 'updater'])
            ->orderBy('expiration_date', 'asc')
            ->get();
    }

    /**
     * Get fast-moving products (products with high transaction volume).
     */
    public function getFastMovingProducts(int $days = 30, int $limit = 10)
    {
        $startDate = Carbon::now()->subDays($days);

        return InventoryProduct::select(
            'inventory_products.id',
            'inventory_products.name',
            'inventory_products.sku',
            'inventory_products.description',
            'inventory_products.price',
            'inventory_products.stock_quantity',
            'inventory_products.reorder_level',
            'inventory_products.expiration_date',
            'inventory_products.status',
            'inventory_products.created_by',
            'inventory_products.updated_by',
            'inventory_products.created_at',
            'inventory_products.updated_at',
            'inventory_products.deleted_at'
        )
            ->selectRaw('SUM(CASE WHEN inventory_transactions.type = "out" THEN inventory_transactions.quantity ELSE 0 END) as total_moved')
            ->join('inventory_transactions', 'inventory_products.id', '=', 'inventory_transactions.product_id')
            ->where('inventory_transactions.created_at', '>=', $startDate)
            ->groupBy(
                'inventory_products.id',
                'inventory_products.name',
                'inventory_products.sku',
                'inventory_products.description',
                'inventory_products.price',
                'inventory_products.stock_quantity',
                'inventory_products.reorder_level',
                'inventory_products.expiration_date',
                'inventory_products.status',
                'inventory_products.created_by',
                'inventory_products.updated_by',
                'inventory_products.created_at',
                'inventory_products.updated_at',
                'inventory_products.deleted_at'
            )
            ->orderByDesc('total_moved')
            ->limit($limit)
            ->with(['creator', 'updater'])
            ->get();
    }

    /**
     * Get slow-moving products (products with low transaction volume).
     */
    public function getSlowMovingProducts(int $days = 30, int $limit = 10)
    {
        $startDate = Carbon::now()->subDays($days);

        return InventoryProduct::select(
            'inventory_products.id',
            'inventory_products.name',
            'inventory_products.sku',
            'inventory_products.description',
            'inventory_products.price',
            'inventory_products.stock_quantity',
            'inventory_products.reorder_level',
            'inventory_products.expiration_date',
            'inventory_products.status',
            'inventory_products.created_by',
            'inventory_products.updated_by',
            'inventory_products.created_at',
            'inventory_products.updated_at',
            'inventory_products.deleted_at'
        )
            ->selectRaw('COALESCE(SUM(CASE WHEN inventory_transactions.type = "out" THEN inventory_transactions.quantity ELSE 0 END), 0) as total_moved')
            ->leftJoin('inventory_transactions', function ($join) use ($startDate) {
                $join->on('inventory_products.id', '=', 'inventory_transactions.product_id')
                    ->where('inventory_transactions.created_at', '>=', $startDate);
            })
            ->where('inventory_products.status', 'active')
            ->groupBy(
                'inventory_products.id',
                'inventory_products.name',
                'inventory_products.sku',
                'inventory_products.description',
                'inventory_products.price',
                'inventory_products.stock_quantity',
                'inventory_products.reorder_level',
                'inventory_products.expiration_date',
                'inventory_products.status',
                'inventory_products.created_by',
                'inventory_products.updated_by',
                'inventory_products.created_at',
                'inventory_products.updated_at',
                'inventory_products.deleted_at'
            )
            ->orderBy('total_moved', 'asc')
            ->limit($limit)
            ->with(['creator', 'updater'])
            ->get();
    }

    /**
     * Get inventory statistics.
     */
    public function getInventoryStatistics(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? Carbon::now()->startOfMonth();
        $endDate = $endDate ?? Carbon::now()->endOfMonth();

        $totalProducts = InventoryProduct::active()->count();
        $totalStockValue = InventoryProduct::active()->selectRaw('SUM(stock_quantity * price) as total')->value('total') ?? 0;
        $lowStockCount = InventoryProduct::lowStock()->active()->count();
        $expiredCount = InventoryProduct::expired()->count();
        $expiringSoonCount = InventoryProduct::expiringSoon()->count();

        $stockInCount = InventoryTransaction::stockIn()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('quantity');

        $stockOutCount = InventoryTransaction::stockOut()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('quantity');

        return [
            'total_products' => $totalProducts,
            'total_stock_value' => round($totalStockValue, 2),
            'low_stock_count' => $lowStockCount,
            'expired_count' => $expiredCount,
            'expiring_soon_count' => $expiringSoonCount,
            'stock_in_count' => $stockInCount,
            'stock_out_count' => $stockOutCount,
            'net_stock_change' => $stockInCount - $stockOutCount,
        ];
    }

    /**
     * Get stock movements for a date range.
     */
    public function getStockMovements(?Carbon $startDate = null, ?Carbon $endDate = null, ?int $productId = null)
    {
        $query = InventoryTransaction::with(['product', 'creator']);

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Check if product has sufficient stock.
     */
    public function hasSufficientStock(Product $product, int $requiredQuantity): bool
    {
        return $product->stock_quantity >= $requiredQuantity;
    }

    /**
     * Deduct stock for multiple products (e.g., when selling a package).
     */
    public function deductStockBatch(array $items, ?string $referenceType = null, ?int $referenceId = null): bool
    {
        return DB::transaction(function () use ($items, $referenceType, $referenceId) {
            foreach ($items as $item) {
                $product = InventoryProduct::find($item['product_id']);

                if (! $product || ! $this->hasSufficientStock($product, $item['quantity'])) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $this->recordTransaction(
                    $product,
                    'out',
                    $item['quantity'],
                    $referenceType,
                    $referenceId,
                    $item['notes'] ?? null
                );
            }

            return true;
        });
    }
}
