<?php

use App\Models\CompanySetting;

if (! function_exists('company_settings')) {
    /**
     * Get the company settings.
     */
    function company_settings(): CompanySetting
    {
        return CompanySetting::get();
    }
}
