<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->json('permissions')->nullable()->after('department'); // Array of permissions
            $table->boolean('can_release_orders')->default(false)->after('permissions');
            $table->boolean('can_mark_paid')->default(true)->after('can_release_orders');
            $table->boolean('can_cancel_orders')->default(true)->after('can_mark_paid');
            $table->boolean('can_view_reports')->default(false)->after('can_cancel_orders');
            $table->boolean('is_active')->default(true)->after('can_view_reports');
        });
    }

    public function down(): void
    {
        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'permissions',
                'can_release_orders',
                'can_mark_paid',
                'can_cancel_orders',
                'can_view_reports',
                'is_active',
            ]);
        });
    }
};
