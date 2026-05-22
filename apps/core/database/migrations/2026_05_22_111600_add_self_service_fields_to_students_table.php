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
        Schema::table('students', function (Blueprint $table) {
            $table->string('source')->default('admin_created')->after('level');
            $table->string('verification_status')->default('verified')->after('source');
            $table->timestamp('verified_at')->nullable()->after('verification_status');
            $table->foreignId('verified_by_id')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
            $table->text('review_notes')->nullable()->after('verified_by_id');

            $table->index('source');
            $table->index('verification_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_by_id');
            $table->dropIndex(['source']);
            $table->dropIndex(['verification_status']);
            $table->dropColumn([
                'source',
                'verification_status',
                'verified_at',
                'review_notes',
            ]);
        });
    }
};
