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
        Schema::create('permit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('academic_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('request_reference')->unique();
            $table->string('source')->default('self_service');
            $table->string('status');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('GHS');
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->boolean('requires_review')->default(false);
            $table->string('review_status')->nullable();
            $table->foreignId('reviewed_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('student_id');
            $table->index('academic_period_id');
            $table->index('requires_review');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permit_requests');
    }
};
