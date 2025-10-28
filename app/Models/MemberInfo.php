<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberInfo extends Model
{
    use HasFactory;

    protected $table = 'members_info';

    protected $fillable = [
        'user_id',
        'MID',
        'email',
        'fname',
        'mname',
        'lname',
        'sex',
        'bday',
        'region',
        'province',
        'city',
        'brgy',
        'st_building',
        'zip',
        'address',
        'tin',
        'mobile',
        'mobile_2',
        'current_rank',
        'package_type',
        'is_active',
        'kick_start_token',
        'last_payment_date',
    ];

    protected $casts = [
        'bday' => 'date',
        'last_payment_date' => 'date',
    ];

    /**
     * Relationship to the User model.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function accounts()
    {
        return $this->hasMany(MemberAccount::class, 'member_id');
    }

    public function encashments()
    {
        return $this->hasMany(Encashment::class, 'member_id');
    }

    /**
     * Calculate the total income from all sources.
     */
    public function getTotalIncome(): float
    {
        $accountIds = $this->accounts()->pluck('id')->toArray();

        // Income from pairing/binary
        $pairingIncome = MemberIncomeHistory::whereIn('ancestor_account_id', $accountIds)->sum('amount');

        // Income from commissions
        $commissionIncome = Commission::whereIn('member_account_id', $accountIds)->sum('amount');

        return (float) ($pairingIncome + $commissionIncome);
    }

    /**
     * Calculate the total approved/processed/released encashments.
     */
    public function getTotalEncashed(): float
    {
        return (float) $this->encashments()
            ->whereIn('status', ['approved', 'processed', 'released'])
            ->sum('amount');
    }

    /**
     * Calculate the available balance for encashment.
     */
    public function getAvailableBalance(): float
    {
        $totalIncome = $this->getTotalIncome();
        $totalEncashed = $this->getTotalEncashed();
        $pendingEncashments = (float) $this->encashments()
            ->where('status', 'pending')
            ->sum('amount');

        return max(0, $totalIncome - $totalEncashed - $pendingEncashments);
    }
}
