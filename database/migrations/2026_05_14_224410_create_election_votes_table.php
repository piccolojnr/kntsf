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
        Schema::create('election_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained()->cascadeOnDelete();
            $table->foreignId('election_position_id')->constrained()->cascadeOnDelete();
            $table->foreignId('election_candidate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->timestamp('cast_at');
            $table->json('metadata')->nullable();

            $table->unique(['election_position_id', 'student_id']);
            $table->index(['election_id', 'student_id']);
            $table->index('election_candidate_id');
            $table->index('cast_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('election_votes');
    }
};
