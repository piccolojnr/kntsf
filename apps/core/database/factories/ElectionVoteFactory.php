<?php

namespace Database\Factories;

use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\ElectionVote;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ElectionVote>
 */
class ElectionVoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $election = Election::factory();
        $position = ElectionPosition::factory()->state([
            'election_id' => $election,
        ]);

        return [
            'election_id' => $election,
            'election_position_id' => $position,
            'election_candidate_id' => ElectionCandidate::factory()->state([
                'election_position_id' => $position,
            ]),
            'student_id' => Student::factory(),
            'cast_at' => now(),
            'metadata' => [],
        ];
    }
}
