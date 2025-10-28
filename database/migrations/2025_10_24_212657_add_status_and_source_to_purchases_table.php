<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->enum('status', ['pending', 'for_payment', 'paid', 'for_release', 'released', 'completed', 'cancelled'])
                ->default('pending')->after('paid_at');
            $table->enum('source', ['POS', 'ECM'])->default('POS')->after('status');
            $table->string('received_by')->nullable()->after('source');
            $table->timestamp('released_at')->nullable()->after('received_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['status', 'source', 'received_by', 'released_at']);
        });
    }
};
