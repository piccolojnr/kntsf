<?php

namespace Database\Factories;

use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'author_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 999),
            'excerpt' => fake()->optional()->paragraph(),
            'content' => fake()->paragraphs(3, true),
            'category' => fake()->optional()->randomElement(['Campus', 'SRC', 'Academic']),
            'status' => PublishStatus::Draft,
            'visibility' => Visibility::Public,
            'is_featured' => false,
            'published_at' => null,
            'archived_at' => null,
            'metadata' => [],
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => [
            'status' => PublishStatus::Published,
            'published_at' => now()->subHour(),
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (): array => [
            'status' => PublishStatus::Archived,
            'archived_at' => now(),
        ]);
    }
}
