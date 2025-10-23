<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberIncomeHistory extends Model
{
    use HasFactory;

    protected $table = 'members_income_history';

    protected $fillable = [
        'ancestor_account_id',
        'pairing_history_id',
        'amount',
        'source',
        'description',
    ];

    public function ancestor()
    {
        return $this->belongsTo(MemberAccount::class, 'ancestor_account_id');
    }

    public function pairing()
    {
        return $this->belongsTo(MemberPairingHistory::class, 'pairing_history_id');
    }
}
