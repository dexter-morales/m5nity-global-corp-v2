<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'phone',
        'email',
        'website',
        'tax_id',
        'logo_path',
        'receipt_header',
        'receipt_footer',
    ];

    /**
     * Get the company settings (singleton pattern)
     */
    public static function get()
    {
        return static::first() ?? static::create([
            'company_name' => 'My Company',
        ]);
    }
}
