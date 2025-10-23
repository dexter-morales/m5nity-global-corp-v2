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
}
