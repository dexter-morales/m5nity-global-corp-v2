<?php

namespace App\Services;

use App\Models\CompensationSetting;

class CompensationService
{
    public function settings(): CompensationSetting
    {
        return CompensationSetting::current();
    }

    public function referralBonus(): int
    {
        return $this->settings()->referral_bonus;
    }

    public function maintenanceMinimum(): int
    {
        return $this->settings()->maintenance_minimum;
    }

    public function unilevelPercentForLevel(int $level): float
    {
        $settings = $this->settings();
        $max = $settings->unilevel_max_level ?? 15;
        if ($level < 1 || $level > $max) {
            return 0.0;
        }
        $percents = $settings->unilevel_percents ?? [];
        $key = (string) $level;
        return isset($percents[$key]) ? (float) $percents[$key] : 0.0;
    }
}
