<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members_pairing_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ancestor_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->foreignId('node_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->enum('side', ['left', 'right']);
            $table->unsignedInteger('level');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members_pairing_queue');
    }
};

