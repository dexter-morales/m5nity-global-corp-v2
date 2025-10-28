<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_products';

    protected $fillable = [
        'name',
        'sku',
        'description',
        'price',
        'stock_quantity',
        'reorder_level',
        'expiration_date',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'expiration_date' => 'date',
        'stock_quantity' => 'integer',
        'reorder_level' => 'integer',
    ];

    protected $appends = [
        'is_low_stock',
        'is_expired',
        'is_expiring_soon',
    ];

    /**
     * Check if product is low on stock
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->stock_quantity <= $this->reorder_level;
    }

    /**
     * Check if product is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        if (! $this->expiration_date) {
            return false;
        }

        return $this->expiration_date->isPast();
    }

    /**
     * Check if product is expiring soon (within 30 days)
     */
    public function getIsExpiringSoonAttribute(): bool
    {
        if (! $this->expiration_date) {
            return false;
        }

        return $this->expiration_date->isFuture() &&
               $this->expiration_date->diffInDays(now()) <= 30;
    }

    /**
     * Scope for active products
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for low stock products
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'reorder_level');
    }

    /**
     * Scope for expired products
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expiration_date')
            ->whereDate('expiration_date', '<', now());
    }

    /**
     * Scope for products expiring soon (within 30 days)
     */
    public function scopeExpiringSoon($query)
    {
        return $query->whereNotNull('expiration_date')
            ->whereDate('expiration_date', '>=', now())
            ->whereDate('expiration_date', '<=', now()->addDays(30));
    }

    /**
     * Packages that contain this product
     */
    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(Package::class, 'package_product', 'product_id', 'package_id')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * Inventory transactions for this product
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'product_id');
    }

    /**
     * User who created this product
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this product
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
