<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('compensation_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('referral_bonus')->default(500);
            $table->unsignedInteger('maintenance_minimum')->default(320);
            $table->unsignedInteger('unilevel_max_level')->default(15);
            $table->json('unilevel_percents'); // {"1":10,"2":5,...}
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compensation_settings');
    }
};
