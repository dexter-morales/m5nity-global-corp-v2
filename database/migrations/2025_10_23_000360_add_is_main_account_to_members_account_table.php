<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members_account', function (Blueprint $table) {
            $table->boolean('is_main_account')
                ->default(false)
                ->after('member_type');
        });

        DB::table('members_account')
            ->whereNull('under_sponsor')
            ->orWhereIn('member_type', ['root', 'main'])
            ->update(['is_main_account' => true]);
    }

    public function down(): void
    {
        Schema::table('members_account', function (Blueprint $table) {
            $table->dropColumn('is_main_account');
        });
    }
};
