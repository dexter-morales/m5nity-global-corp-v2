<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members_income_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ancestor_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->foreignId('pairing_history_id')->constrained('members_pairing_history')->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->string('source');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members_income_history');
    }
};

