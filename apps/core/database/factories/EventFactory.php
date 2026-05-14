<?php

namespace Database\Factories;

use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
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
            'organizer_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 999),
            'description' => fake()->paragraphs(3, true),
            'excerpt' => fake()->optional()->paragraph(),
            'location' => fake()->optional()->city(),
            'category' => fake()->optional()->randomElement(['SRC', 'Sports', 'Academic']),
            'status' => PublishStatus::Draft,
            'visibility' => Visibility::Public,
            'is_featured' => false,
            'starts_at' => now()->addWeek(),
            'ends_at' => now()->addWeek()->addHours(2),
            'max_attendees' => null,
            'current_attendees' => 0,
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
