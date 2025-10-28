<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompensationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'referral_bonus',
        'maintenance_minimum',
        'unilevel_max_level',
        'unilevel_percents',
    ];

    protected $casts = [
        'unilevel_percents' => 'array',
    ];

    public static function current(): self
    {
        return static::query()->orderByDesc('id')->firstOrCreate([], [
            'referral_bonus' => 500,
            'maintenance_minimum' => 320,
            'unilevel_max_level' => 15,
            'unilevel_percents' => [
                '1' => 10,
                '2' => 5,
                '3' => 4,
                '4' => 3,
                '5' => 2,
                '6' => 1,
                '7' => 1,
                '8' => 1,
                '9' => 1,
                '10' => 1,
                '11' => 1,
                '12' => 1,
                '13' => 1,
                '14' => 1,
                '15' => 1,
            ],
        ]);
    }
}
