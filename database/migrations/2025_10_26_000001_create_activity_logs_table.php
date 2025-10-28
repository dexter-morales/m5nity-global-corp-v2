<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('log_type')->index(); // 'registration', 'pos_order', 'payment', 'release', 'cancel', 'bulk_operation'
            $table->string('action'); // 'create', 'update', 'delete', 'mark_paid', 'release', etc.
            $table->text('description');
            $table->json('metadata')->nullable(); // Store order IDs, amounts, etc.
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamps();
            $table->index(['user_id', 'log_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
