<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberMaintenance extends Model
{
    use HasFactory;

    protected $table = 'members_maintenance';

    protected $fillable = [
        'members_account_id',
        'month',
        'total_spent',
        'is_active',
        'activated_at',
    ];

    protected $casts = [
        'activated_at' => 'datetime',
    ];
}

