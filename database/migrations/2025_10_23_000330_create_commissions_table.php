<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->enum('source', ['referral', 'unilevel', 'adjustment']);
            $table->unsignedInteger('amount');
            $table->unsignedInteger('level')->nullable();
            $table->decimal('percent', 5, 2)->nullable();
            $table->foreignId('purchase_id')->nullable()->constrained('purchases')->nullOnDelete();
            $table->unsignedBigInteger('downline_account_id')->nullable()->comment('members_account.id of buyer');
            $table->string('description')->nullable();
            $table->string('trans_no')->nullable();
            $table->timestamps();

            $table->index(['member_account_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
