<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members_pairing_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ancestor_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->foreignId('left_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->foreignId('right_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->unsignedInteger('level');
            $table->unsignedInteger('amount');
            $table->timestamp('paired_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members_pairing_history');
    }
};

