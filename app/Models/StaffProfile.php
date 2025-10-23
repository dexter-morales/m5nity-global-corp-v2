<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'first_name',
        'middle_name',
        'last_name',
        'contact_number',
        'department',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
