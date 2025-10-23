<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    protected $fillable = ['user_id', 'amount', 'level', 'type'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
