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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description');
            $table->text('excerpt')->nullable();
            $table->string('location')->nullable();
            $table->string('category', 100)->nullable();
            $table->string('status')->default('draft');
            $table->string('visibility')->default('public');
            $table->boolean('is_featured')->default(false);
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('max_attendees')->nullable();
            $table->unsignedInteger('current_attendees')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('organizer_id');
            $table->index(['status', 'published_at']);
            $table->index(['visibility', 'status']);
            $table->index('is_featured');
            $table->index('starts_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
