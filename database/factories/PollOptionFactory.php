<?php

namespace Database\Factories;

use App\Enums\PollOptionStatus;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PollOption>
 */
class PollOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'poll_id' => Poll::factory(),
            'text' => fake()->words(3, true),
            'status' => PollOptionStatus::Active,
            'merged_into_id' => null,
            'created_by_student_id' => null,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }

    public function createdByStudent(): static
    {
        return $this->state(fn (): array => [
            'created_by_student_id' => Student::factory(),
        ]);
    }
}
