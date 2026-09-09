<?php

namespace App\Actions\Verification;

use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\Permit;
use App\Models\Student;

final readonly class VerificationAttemptResult
{
    public function __construct(
        public VerificationMethod $method,
        public VerificationResult $result,
        public ?string $identifierHash,
        public ?string $reason = null,
        public ?Student $student = null,
        public ?Permit $permit = null,
    ) {}

    /**
     * @return array{method: string, result: string, result_label: string, reason: string|null, student: array{id: int, student_number: string, name: string|null}|null, permit: array{id: int, code_last4: string|null, status: string}|null}
     */
    public function toFrontend(): array
    {
        return [
            'method' => $this->method->value,
            'result' => $this->result->value,
            'result_label' => str($this->result->value)->replace('_', ' ')->title()->toString(),
            'reason' => $this->reason,
            'student' => $this->student === null ? null : [
                'id' => $this->student->id,
                'student_number' => $this->student->student_number,
                'name' => $this->student->name,
            ],
            'permit' => $this->permit === null ? null : [
                'id' => $this->permit->id,
                'code_last4' => $this->permit->code_last4,
                'status' => $this->permit->status->value,
            ],
        ];
    }
}
