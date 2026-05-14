<?php

namespace Database\Factories;

use App\Enums\ElectionPositionStatus;
use App\Models\Election;
use App\Models\ElectionPosition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ElectionPosition>
 */
class ElectionPositionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'election_id' => Election::factory(),
            'title' => fake()->randomElement(['SRC President', 'General Secretary', 'Treasurer']),
            'description' => fake()->optional()->sentence(),
            'max_winners' => 1,
            'status' => ElectionPositionStatus::Active,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
