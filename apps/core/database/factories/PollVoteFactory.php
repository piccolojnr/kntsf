<?php

namespace Database\Factories;

use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PollVote>
 */
class PollVoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $poll = Poll::factory();

        return [
            'poll_id' => $poll,
            'poll_option_id' => PollOption::factory()->state([
                'poll_id' => $poll,
            ]),
            'student_id' => Student::factory(),
        ];
    }
}
