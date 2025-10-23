<?php

namespace Database\Seeders;

use App\Models\MemberInfo;
use App\Models\User;
use Illuminate\Database\Seeder;

class BackfillMemberUtypeSeeder extends Seeder
{
    public function run(): void
    {
        $memberUserIds = MemberInfo::query()->pluck('user_id');
        if ($memberUserIds->isEmpty()) {
            return;
        }

        User::query()
            ->whereIn('id', $memberUserIds)
            ->where(function ($q) {
                $q->whereNull('utype')->orWhere('utype', '');
            })
            ->update(['utype' => 'member']);
    }
}

