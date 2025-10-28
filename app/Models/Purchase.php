<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    // Status constants
    const STATUS_PENDING = 'pending';

    const STATUS_FOR_PAYMENT = 'for_payment';

    const STATUS_PAID = 'paid';

    const STATUS_FOR_RELEASE = 'for_release';

    const STATUS_RELEASED = 'released';

    const STATUS_COMPLETED = 'completed';

    const STATUS_CANCELLED = 'cancelled';

    // Source constants
    const SOURCE_POS = 'POS';

    const SOURCE_ECM = 'ECM';

    protected $fillable = [
        'trans_no',
        'cashier_id',
        'buyer_account_id',
        'total_amount',
        'payment_method',
        'paid_at',
        'status',
        'source',
        'received_by',
        'released_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function buyerAccount()
    {
        return $this->belongsTo(MemberAccount::class, 'buyer_account_id');
    }

    public function cashier()
    {
        return $this->belongsTo(\App\Models\User::class, 'cashier_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeForPayment($query)
    {
        return $query->where('status', self::STATUS_FOR_PAYMENT);
    }

    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    public function scopeForRelease($query)
    {
        return $query->where('status', self::STATUS_FOR_RELEASE);
    }

    public function scopeReleased($query)
    {
        return $query->where('status', self::STATUS_RELEASED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    public function scopeFromPOS($query)
    {
        return $query->where('source', self::SOURCE_POS);
    }

    public function scopeFromECM($query)
    {
        return $query->where('source', self::SOURCE_ECM);
    }

    public function scopeByCashier($query, $cashierId)
    {
        return $query->where('cashier_id', $cashierId);
    }
}
