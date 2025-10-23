<?php

namespace App\Support;

use App\Models\MemberInfo;
use App\Models\MemberPin;
use Illuminate\Support\Str;

class IdentifierGenerator
{
    public static function generateMemberId(): string
    {
        $year = now()->format('y');
        $country = 'PH';
        $sequence = (MemberInfo::max('id') ?? 0) + 1;
        $nextNumber = str_pad((string) $sequence, 8, '0', STR_PAD_LEFT);

        return "{$year}{$country}{$nextNumber}";
    }

    public static function generateTransactionNumber(): array
    {
        $year = now()->format('y');
        $country = 'PH';
        $sequence = (MemberPin::max('id') ?? 0) + 1;
        $baseNumber = str_pad((string) $sequence, 8, '0', STR_PAD_LEFT);
        $baseCode = "{$year}{$country}{$baseNumber}";

        $randSegment = Str::lower(Str::random(5));
        $randSuffix = Str::upper(Str::random(5));

        $transaction = "T-{$baseCode}-{$randSegment}";
        $pin = "{$baseCode}-{$randSegment}-{$randSuffix}";

        return [
            'base' => $baseCode,
            'transaction' => $transaction,
            'pin' => $pin,
        ];
    }
}
