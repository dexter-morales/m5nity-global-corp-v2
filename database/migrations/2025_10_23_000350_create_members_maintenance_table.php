<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members_maintenance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('members_account_id')->constrained('members_account')->cascadeOnDelete();
            $table->string('month', 7); // YYYY-MM
            $table->unsignedInteger('total_spent')->default(0);
            $table->boolean('is_active')->default(false);
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();

            $table->unique(['members_account_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members_maintenance');
    }
};
