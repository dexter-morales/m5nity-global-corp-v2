<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_id',
        'member_pin_id',
        'trans_no',
        'payment_method',
        'member_email',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function memberPin()
    {
        return $this->belongsTo(MemberPin::class, 'member_pin_id');
    }
}
