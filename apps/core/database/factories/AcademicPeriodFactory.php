<?php

namespace Database\Factories;

use App\Models\AcademicPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicPeriod>
 */
class AcademicPeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['First Semester', 'Second Semester']),
            'academic_year' => fake()->randomElement(['2025/2026', '2026/2027']),
            'semester' => fake()->randomElement(['First Semester', 'Second Semester']),
            'starts_at' => now()->startOfMonth()->toDateString(),
            'ends_at' => now()->addMonths(4)->endOfMonth()->toDateString(),
            'is_active' => false,
            'metadata' => [],
        ];
    }

    public function active(): static
    {
        return $this->state(fn (): array => [
            'is_active' => true,
        ]);
    }
}
