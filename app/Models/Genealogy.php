<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genealogy extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'member_id',
        'members_account_id',
        'parent_id',
        'position',
        'level',
        'pair_value',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function memberInfo()
    {
        return $this->belongsTo(MemberInfo::class, 'member_id');
    }

    public function account()
    {
        return $this->belongsTo(MemberAccount::class, 'members_account_id');
    }

    public function parent()
    {
        return $this->belongsTo(MemberAccount::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id', 'members_account_id');
    }
}
