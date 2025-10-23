<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberPairingQueue extends Model
{
    use HasFactory;

    protected $table = 'members_pairing_queue';

    protected $fillable = [
        'ancestor_account_id',
        'node_account_id',
        'side',
        'level',
    ];

    public function ancestor()
    {
        return $this->belongsTo(MemberAccount::class, 'ancestor_account_id');
    }

    public function node()
    {
        return $this->belongsTo(MemberAccount::class, 'node_account_id');
    }
}
