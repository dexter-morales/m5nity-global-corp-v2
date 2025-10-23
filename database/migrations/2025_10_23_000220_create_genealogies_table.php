<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('genealogies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members_info')->cascadeOnDelete();
            $table->foreignId('members_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable()->comment('references members_account.id');
            $table->enum('position', ['left', 'right'])->nullable();
            $table->unsignedInteger('level')->default(1);
            $table->unsignedInteger('pair_value')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('genealogies');
    }
};

