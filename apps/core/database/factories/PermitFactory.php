<?php

namespace Database\Factories;

use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\Permit;
use App\Models\Student;
use App\Support\PermitCodeHasher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Permit>
 */
class PermitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $code = fake()->unique()->bothify('KNT-####-????-####');

        return [
            'student_id' => Student::factory(),
            'academic_period_id' => AcademicPeriod::factory(),
            'code_hash' => app(PermitCodeHasher::class)->hash($code),
            'code_last4' => mb_substr($code, -4),
            'status' => PermitStatus::Active,
            'starts_at' => now(),
            'expires_at' => now()->addDays(120),
            'amount_paid' => 0,
            'currency' => 'GHS',
            'metadata' => [],
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn (): array => [
            'status' => PermitStatus::Revoked,
            'revoked_at' => now(),
            'revocation_reason' => 'Revoked for testing.',
        ]);
    }
}
