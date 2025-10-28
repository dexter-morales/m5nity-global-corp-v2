<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProductController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        // Check permissions
        $this->authorize('viewAny', InventoryProduct::class);

        $query = InventoryProduct::with(['creator', 'updater', 'packages']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by stock level
        if ($request->has('stock_filter')) {
            switch ($request->stock_filter) {
                case 'low':
                    $query->lowStock();
                    break;
                case 'out':
                    $query->where('stock_quantity', 0);
                    break;
            }
        }

        // Filter by expiration
        if ($request->has('expiration_filter')) {
            switch ($request->expiration_filter) {
                case 'expired':
                    $query->expired();
                    break;
                case 'expiring_soon':
                    $query->expiringSoon();
                    break;
            }
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $products = $query->paginate($request->get('per_page', 15));

        $user = $request->user();

        return Inertia::render('Inventory/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'stock_filter', 'expiration_filter', 'sort', 'direction']),
            'can' => [
                'create' => Gate::allows('create', InventoryProduct::class),
                'update' => in_array($user->utype, ['releasing_personnel', 'admin', 'super_admin', 'superadmin']),
                'delete' => in_array($user->utype, ['admin', 'super_admin', 'superadmin']),
            ],
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        $this->authorize('create', InventoryProduct::class);

        return Inertia::render('Inventory/Products/Create');
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $this->authorize('create', InventoryProduct::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:inventory_products,sku',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiration_date' => 'nullable|date|after:today',
            'status' => 'required|in:active,inactive,discontinued',
        ]);

        $product = InventoryProduct::create([
            ...$validated,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        // Record initial stock if > 0
        if ($product->stock_quantity > 0) {
            $this->inventoryService->recordTransaction(
                $product,
                'in',
                $product->stock_quantity,
                'initial_stock',
                null,
                'Initial stock entry'
            );
        }

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified product.
     */
    public function show(InventoryProduct $product)
    {
        $this->authorize('view', $product);

        $product->load(['creator', 'updater', 'packages', 'transactions.creator']);

        return Inertia::render('Inventory/Products/Show', [
            'product' => $product,
            'can' => [
                'update' => Gate::allows('update', $product),
                'delete' => Gate::allows('delete', $product),
            ],
        ]);
    }

    /**
     * Show the form for editing the product.
     */
    public function edit(InventoryProduct $product)
    {
        $this->authorize('update', $product);

        $product->load(['packages']);

        return Inertia::render('Inventory/Products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, InventoryProduct $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:inventory_products,sku,'.$product->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiration_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,discontinued',
        ]);

        $product->update([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy(InventoryProduct $product)
    {
        $this->authorize('delete', $product);

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Adjust stock quantity.
     */
    public function adjustStock(Request $request, InventoryProduct $product)
    {
        $this->authorize('adjustStock', $product);

        $validated = $request->validate([
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $this->inventoryService->recordTransaction(
            $product,
            $validated['type'],
            $validated['quantity'],
            'manual_adjustment',
            null,
            $validated['notes'] ?? null
        );

        return back()->with('success', 'Stock adjusted successfully.');
    }
}
