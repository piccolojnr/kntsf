<?php

namespace Database\Factories;

use App\Enums\PermitRequestStatus;
use App\Models\AcademicPeriod;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Support\PermitRequestReferenceGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PermitRequest>
 */
class PermitRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'academic_period_id' => AcademicPeriod::factory(),
            'request_reference' => app(PermitRequestReferenceGenerator::class)->generate(),
            'source' => 'self_service',
            'status' => PermitRequestStatus::Pending,
            'amount' => 50,
            'currency' => 'GHS',
            'contact_email' => fake()->safeEmail(),
            'contact_phone' => fake()->phoneNumber(),
            'requires_review' => false,
            'metadata' => [],
        ];
    }
}
