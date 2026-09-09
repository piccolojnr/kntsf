<?php

namespace Database\Factories;

use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
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
            'description' => fake()->optional()->paragraphs(3, true),
            'category' => fake()->optional()->randomElement(['Governance', 'Permits', 'Elections', 'Minutes']),
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
