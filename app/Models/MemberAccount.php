<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberAccount extends Model
{
    use HasFactory;

    protected $table = 'members_account';

    protected $fillable = [
        'member_id',
        'account_name',
        'dsponsor',
        'under_sponsor',
        'node',
        'upper_nodes',
        'member_type',
        'is_main_account',
        'package_type',
        'rank_id',
        'remarks',
    ];

    protected $casts = [
        'upper_nodes' => 'array',
        'is_main_account' => 'boolean',
    ];

    public function memberInfo()
    {
        return $this->belongsTo(MemberInfo::class, 'member_id');
    }

    public function directSponsor()
    {
        return $this->belongsTo(MemberInfo::class, 'dsponsor');
    }

    public function placementAccount()
    {
        return $this->belongsTo(self::class, 'under_sponsor');
    }

    public function downlines()
    {
        return $this->hasMany(self::class, 'under_sponsor');
    }

    public function genealogies()
    {
        return $this->hasMany(Genealogy::class, 'members_account_id');
    }
}
