<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members_info', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('MID')->nullable();
            $table->string('email')->unique();
            $table->string('fname')->nullable();
            $table->string('mname')->nullable();
            $table->string('lname')->nullable();
            $table->string('sex')->nullable();
            $table->date('bday')->nullable();
            $table->string('region')->nullable();
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('brgy')->nullable();
            $table->string('st_building')->nullable();
            $table->string('zip')->nullable();
            $table->string('address')->nullable();
            $table->string('tin')->nullable();
            $table->string('mobile')->nullable();
            $table->string('mobile_2')->nullable();
            $table->string('current_rank')->nullable();
            $table->string('package_type')->nullable();
            $table->boolean('is_active')->default(false);
            $table->uuid('kick_start_token')->nullable();
            $table->date('last_payment_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members_info');
    }
};

