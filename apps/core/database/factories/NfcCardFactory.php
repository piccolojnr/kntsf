<?php

namespace Database\Factories;

use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use App\Models\Student;
use App\Support\NfcUidHasher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NfcCard>
 */
class NfcCardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uid = fake()->unique()->bothify('04:##:##:??:??:##');

        return [
            'student_id' => Student::factory(),
            'uid_hash' => app(NfcUidHasher::class)->hash($uid),
            'uid_last4' => app(NfcUidHasher::class)->lastFour($uid),
            'status' => NfcCardStatus::Active,
            'issued_at' => now(),
            'activated_at' => now(),
            'metadata' => [],
        ];
    }

    public function lost(): static
    {
        return $this->state(fn (): array => [
            'status' => NfcCardStatus::Lost,
            'lost_at' => now(),
            'deactivated_at' => now(),
        ]);
    }

    public function revoked(): static
    {
        return $this->state(fn (): array => [
            'status' => NfcCardStatus::Revoked,
            'deactivated_at' => now(),
        ]);
    }
}
