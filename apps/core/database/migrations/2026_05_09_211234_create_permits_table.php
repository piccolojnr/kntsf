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
        Schema::create('permits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_period_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('issued_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code_hash')->unique();
            $table->string('code_last4', 4)->nullable()->index();
            $table->string('status')->default('active');
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('currency', 3)->default('GHS');
            $table->timestamp('card_delivered_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('revocation_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'status']);
            $table->index(['academic_period_id', 'status']);
            $table->index(['status', 'expires_at']);
            $table->index('issued_by_id');
            $table->index('revoked_by_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permits');
    }
};
