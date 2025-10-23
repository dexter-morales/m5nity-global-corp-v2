<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberPin extends Model
{
    use HasFactory;

    protected $table = 'members_pin';

    protected $fillable = [
        'sponsor_id',
        'trans_no',
        'payment_method',
        'new_member_id',
        'member_email',
        'pin',
        'status',
    ];

    public function sponsorAccount()
    {
        return $this->belongsTo(MemberAccount::class, 'sponsor_id');
    }

    public function newMember()
    {
        return $this->belongsTo(MemberInfo::class, 'new_member_id');
    }

    public function transactions()
    {
        return $this->hasMany(TransactionHistory::class, 'member_pin_id');
    }
}
