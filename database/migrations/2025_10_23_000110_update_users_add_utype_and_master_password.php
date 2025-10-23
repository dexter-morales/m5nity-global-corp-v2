<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('utype')->nullable()->after('password');
            $table->foreignId('master_password_id')->nullable()->constrained('master_passwords')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'master_password_id')) {
                $table->dropConstrainedForeignId('master_password_id');
            }
            if (Schema::hasColumn('users', 'utype')) {
                $table->dropColumn('utype');
            }
        });
    }
};

