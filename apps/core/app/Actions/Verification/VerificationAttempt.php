<?php

namespace App\Actions\Verification;

use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\Permit;
use App\Models\Student;

final readonly class VerificationAttempt
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public VerificationMethod $method,
        public VerificationResult $result,
        public string $identifierHash,
        public ?string $reason = null,
        public ?Student $student = null,
        public ?Permit $permit = null,
        public array $metadata = [],
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toPayload(): array
    {
        return [
            'method' => $this->method->value,
            'method_label' => str($this->method->value)->replace('_', ' ')->title()->toString(),
            'result' => $this->result->value,
            'result_label' => str($this->result->value)->replace('_', ' ')->title()->toString(),
            'reason' => $this->reason,
            'student' => $this->student ? [
                'id' => $this->student->id,
                'student_number' => $this->student->student_number,
                'name' => $this->student->name,
                'email' => $this->student->email,
                'course' => $this->student->course,
                'level' => $this->student->level,
            ] : null,
            'permit' => $this->permit ? [
                'id' => $this->permit->id,
                'code_last4' => $this->permit->code_last4,
                'status' => $this->permit->status->value,
                'starts_at' => $this->permit->starts_at?->toISOString(),
                'expires_at' => $this->permit->expires_at?->toISOString(),
                'academic_period' => $this->permit->academicPeriod ? [
                    'id' => $this->permit->academicPeriod->id,
                    'name' => $this->permit->academicPeriod->name,
                ] : null,
            ] : null,
        ];
    }
}
