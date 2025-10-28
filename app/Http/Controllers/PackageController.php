<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PackageController extends Controller
{
    /**
     * Display a listing of packages.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Package::class);

        $query = Package::with(['creator', 'updater', 'products']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $packages = $query->paginate($request->get('per_page', 15));

        $user = $request->user();

        return Inertia::render('Inventory/Packages/Index', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
            'can' => [
                'create' => Gate::allows('create', Package::class),
                'update' => in_array($user->utype, ['admin', 'super_admin', 'superadmin']),
                'delete' => in_array($user->utype, ['admin', 'super_admin', 'superadmin']),
            ],
        ]);
    }

    /**
     * Show the form for creating a new package.
     */
    public function create()
    {
        $this->authorize('create', Package::class);

        $products = InventoryProduct::active()->get();

        return Inertia::render('Inventory/Packages/Create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created package.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Package::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:packages,code',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            $package = Package::create([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'status' => $validated['status'],
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            // Attach products
            if (isset($validated['products'])) {
                foreach ($validated['products'] as $productData) {
                    $package->products()->attach($productData['product_id'], [
                        'quantity' => $productData['quantity'],
                    ]);
                }
            }

            return $package;
        });

        return redirect()->route('packages.index')
            ->with('success', 'Package created successfully.');
    }

    /**
     * Display the specified package.
     */
    public function show(Package $package)
    {
        $this->authorize('view', $package);

        $package->load(['creator', 'updater', 'products']);

        return Inertia::render('Inventory/Packages/Show', [
            'package' => $package,
            'can' => [
                'update' => Gate::allows('update', $package),
                'delete' => Gate::allows('delete', $package),
            ],
        ]);
    }

    /**
     * Show the form for editing the package.
     */
    public function edit(Package $package)
    {
        $this->authorize('update', $package);

        $package->load(['products']);
        $products = InventoryProduct::active()->get();

        return Inertia::render('Inventory/Packages/Edit', [
            'package' => $package,
            'products' => $products,
        ]);
    }

    /**
     * Update the specified package.
     */
    public function update(Request $request, Package $package)
    {
        $this->authorize('update', $package);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:packages,code,'.$package->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, $package) {
            $package->update([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'status' => $validated['status'],
                'updated_by' => auth()->id(),
            ]);

            // Sync products
            $productsToSync = [];
            if (isset($validated['products'])) {
                foreach ($validated['products'] as $productData) {
                    $productsToSync[$productData['product_id']] = [
                        'quantity' => $productData['quantity'],
                    ];
                }
            }
            $package->products()->sync($productsToSync);
        });

        return redirect()->route('packages.index')
            ->with('success', 'Package updated successfully.');
    }

    /**
     * Remove the specified package.
     */
    public function destroy(Package $package)
    {
        $this->authorize('delete', $package);

        $package->delete();

        return redirect()->route('packages.index')
            ->with('success', 'Package deleted successfully.');
    }
}
