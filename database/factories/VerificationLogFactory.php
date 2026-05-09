<?php

namespace Database\Factories;

use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\VerificationLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VerificationLog>
 */
class VerificationLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'method' => VerificationMethod::StudentNumber,
            'result' => VerificationResult::Valid,
            'identifier_hash' => hash('sha256', fake()->uuid()),
            'reason' => 'Verified.',
            'metadata' => [],
        ];
    }
}
