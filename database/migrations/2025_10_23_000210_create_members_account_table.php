<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members_account', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members_info')->cascadeOnDelete();
            $table->string('account_name')->unique();
            $table->foreignId('dsponsor')->nullable()->comment('direct sponsor is member_info id')->constrained('members_info')->nullOnDelete();
            $table->foreignId('under_sponsor')->nullable()->comment('placement is members_account id')->constrained('members_account');
            $table->string('node')->nullable();
            $table->json('upper_nodes')->nullable();
            $table->string('member_type')->nullable();
            $table->string('package_type')->nullable();
            $table->unsignedBigInteger('rank_id')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members_account');
    }
};

