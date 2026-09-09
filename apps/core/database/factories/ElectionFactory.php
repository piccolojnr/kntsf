<?php

namespace Database\Factories;

use App\Enums\ElectionStatus;
use App\Models\AcademicPeriod;
use App\Models\Election;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Election>
 */
class ElectionFactory extends Factory
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
            'academic_period_id' => AcademicPeriod::factory(),
            'created_by_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 999),
            'description' => fake()->optional()->paragraph(),
            'status' => ElectionStatus::Draft,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDays(3),
            'results_visible' => false,
            'metadata' => [],
        ];
    }

    public function active(): static
    {
        return $this->state(fn (): array => [
            'status' => ElectionStatus::Active,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDay(),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (): array => [
            'status' => ElectionStatus::Closed,
            'ends_at' => now()->subHour(),
        ]);
    }
}
