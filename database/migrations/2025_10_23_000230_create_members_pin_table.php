<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members_pin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sponsor_id')->nullable()->constrained('members_account')->nullOnDelete();
            $table->string('trans_no')->unique();
            $table->string('payment_method');
            $table->foreignId('new_member_id')->constrained('members_info')->cascadeOnDelete();
            $table->string('member_email');
            $table->string('pin')->unique();
            $table->enum('status', ['unused', 'used'])->default('unused');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members_pin');
    }
};

