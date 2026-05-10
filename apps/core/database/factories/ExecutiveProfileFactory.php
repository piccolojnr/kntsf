<?php

namespace Database\Factories;

use App\Models\ExecutiveProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExecutiveProfile>
 */
class ExecutiveProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'position' => fake()->randomElement(['President', 'Vice President', 'Secretary', 'Treasurer']),
            'position_description' => fake()->sentence(),
            'biography' => fake()->paragraph(),
            'category' => 'SRC Executive',
            'sort_order' => fake()->numberBetween(0, 20),
            'is_published' => true,
            'social_links' => [],
        ];
    }
}
