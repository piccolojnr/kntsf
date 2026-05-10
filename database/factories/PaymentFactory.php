<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Student;
use App\Support\PaymentReferenceGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
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
            'reference' => app(PaymentReferenceGenerator::class)->generate(),
            'gateway' => 'manual',
            'status' => PaymentStatus::Pending,
            'amount' => fake()->randomFloat(2, 1, 500),
            'currency' => 'GHS',
            'metadata' => [],
        ];
    }

    public function successful(): static
    {
        return $this->state(fn (): array => [
            'status' => PaymentStatus::Success,
            'paid_at' => now(),
            'verified_at' => now(),
        ]);
    }
}
