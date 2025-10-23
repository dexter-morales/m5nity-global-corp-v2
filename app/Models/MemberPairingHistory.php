<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberPairingHistory extends Model
{
    use HasFactory;

    protected $table = 'members_pairing_history';

    protected $fillable = [
        'ancestor_account_id',
        'left_account_id',
        'right_account_id',
        'level',
        'amount',
        'paired_at',
    ];

    protected $casts = [
        'paired_at' => 'datetime',
    ];

    public function ancestor()
    {
        return $this->belongsTo(MemberAccount::class, 'ancestor_account_id');
    }

    public function leftAccount()
    {
        return $this->belongsTo(MemberAccount::class, 'left_account_id');
    }

    public function rightAccount()
    {
        return $this->belongsTo(MemberAccount::class, 'right_account_id');
    }

    public function income()
    {
        return $this->hasMany(MemberIncomeHistory::class, 'pairing_history_id');
    }
}
