<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Encashment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'member_id',
        'member_account_id',
        'encashment_no',
        'amount',
        'status',
        'member_notes',
        'admin_notes',
        'accounting_notes',
        'cashier_notes',
        'approved_by',
        'approved_at',
        'processed_by',
        'processed_at',
        'voucher_no',
        'payment_type',
        'released_by',
        'released_at',
        'received_by',
        'received_by_name',
        'received_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
        'released_at' => 'datetime',
        'received_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * The member who requested the encashment.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberInfo::class, 'member_id');
    }

    /**
     * The member account associated with this encashment.
     */
    public function memberAccount(): BelongsTo
    {
        return $this->belongsTo(MemberAccount::class, 'member_account_id');
    }

    /**
     * The admin who approved the encashment.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * The accounting staff who processed the encashment.
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * The cashier who released the encashment.
     */
    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    /**
     * The member who received the encashment.
     */
    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * The user who rejected the encashment.
     */
    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Check if the encashment can be approved.
     */
    public function canBeApproved(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the encashment can be processed.
     */
    public function canBeProcessed(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the encashment can be released.
     */
    public function canBeReleased(): bool
    {
        return $this->status === 'processed';
    }

    /**
     * Check if the encashment can be rejected.
     */
    public function canBeRejected(): bool
    {
        return in_array($this->status, ['pending', 'approved']);
    }
}
