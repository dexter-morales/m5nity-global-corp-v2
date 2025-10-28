<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_account_id',
        'source',
        'amount',
        'level',
        'percent',
        'purchase_id',
        'downline_account_id',
        'description',
        'trans_no',
    ];

    public function memberAccount()
    {
        return $this->belongsTo(MemberAccount::class, 'member_account_id');
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
}

