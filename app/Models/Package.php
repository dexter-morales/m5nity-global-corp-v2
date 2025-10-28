<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'price',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected $appends = [
        'total_products_count',
    ];

    /**
     * Get the user who created the package.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the package.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the products in this package.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(InventoryProduct::class, 'package_product', 'package_id', 'product_id')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * Get total count of products in package.
     */
    public function getTotalProductsCountAttribute(): int
    {
        return $this->products()->count();
    }

    /**
     * Scope to get active packages.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if package has sufficient stock for all products.
     */
    public function hasSufficientStock(): bool
    {
        foreach ($this->products as $product) {
            if ($product->stock_quantity < $product->pivot->quantity) {
                return false;
            }
        }

        return true;
    }
}
