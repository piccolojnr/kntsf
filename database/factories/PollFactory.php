<?php

namespace Database\Factories;

use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Poll;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Poll>
 */
class PollFactory extends Factory
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
            'created_by_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 999),
            'description' => fake()->optional()->paragraph(),
            'type' => PollType::FixedOptions,
            'status' => PublishStatus::Draft,
            'visibility' => Visibility::Internal,
            'starts_at' => null,
            'ends_at' => null,
            'show_results' => true,
            'allow_vote_change' => false,
            'metadata' => [],
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => [
            'status' => PublishStatus::Published,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDay(),
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (): array => [
            'status' => PublishStatus::Archived,
        ]);
    }
}
