<?php

namespace Database\Factories;

use App\Enums\CandidateStatus;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ElectionCandidate>
 */
class ElectionCandidateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'election_position_id' => ElectionPosition::factory(),
            'student_id' => Student::factory(),
            'approved_by_id' => null,
            'slogan' => fake()->optional()->sentence(4),
            'manifesto' => fake()->optional()->paragraphs(2, true),
            'status' => CandidateStatus::Pending,
            'approved_at' => null,
            'rejected_at' => null,
            'withdrawn_at' => null,
            'metadata' => [],
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'status' => CandidateStatus::Approved,
            'approved_at' => now(),
        ]);
    }
}
