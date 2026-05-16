<?php

namespace App\Actions\Verification;

use App\Enums\PermitStatus;
use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\Permit;
use App\Models\Student;
use App\Support\ActiveAcademicPeriod;
use App\Support\VerificationIdentifierHasher;
use Illuminate\Support\Carbon;

class VerifyStudentNumberAction
{
    public function __construct(
        private readonly VerificationIdentifierHasher $verificationIdentifierHasher,
        private readonly ActiveAcademicPeriod $activeAcademicPeriod,
    ) {}

    public function handle(string $studentNumber): VerificationAttempt
    {
        $identifierHash = $this->verificationIdentifierHasher->hash($studentNumber);

        $student = Student::query()
            ->where('student_number', trim($studentNumber))
            ->first();

        if (! $student) {
            return new VerificationAttempt(
                method: VerificationMethod::StudentNumber,
                result: VerificationResult::NotFound,
                identifierHash: $identifierHash,
                reason: 'No student matched the submitted number.',
            );
        }

        $activePeriod = $this->activeAcademicPeriod->get();

        $permit = $student->permits()
            ->with('academicPeriod')
            ->when($activePeriod, fn ($query) => $query->where('academic_period_id', $activePeriod->id))
            ->latest()
            ->first();

        if (! $permit) {
            return new VerificationAttempt(
                method: VerificationMethod::StudentNumber,
                result: VerificationResult::NotFound,
                identifierHash: $identifierHash,
                reason: $activePeriod
                    ? 'No permit was found for the active academic period.'
                    : 'No permit was found for this student.',
                student: $student,
                metadata: [
                    'active_academic_period_id' => $activePeriod?->id,
                ],
            );
        }

        return $this->evaluatePermit($permit, $identifierHash);
    }

    private function evaluatePermit(Permit $permit, string $identifierHash): VerificationAttempt
    {
        if ($permit->status === PermitStatus::Revoked) {
            return $this->attempt($permit, VerificationResult::Revoked, $identifierHash, 'Student permit has been revoked.');
        }

        if ($permit->status === PermitStatus::Expired || $permit->expires_at->isPast()) {
            if ($permit->status !== PermitStatus::Expired) {
                $permit->forceFill(['status' => PermitStatus::Expired])->save();
            }

            return $this->attempt($permit->refresh(), VerificationResult::Expired, $identifierHash, 'Student permit has expired.');
        }

        if ($permit->starts_at->isFuture()) {
            return $this->attempt($permit, VerificationResult::Invalid, $identifierHash, 'Student permit is not active yet.');
        }

        return $this->attempt($permit, VerificationResult::Valid, $identifierHash, 'Student permit is valid.');
    }

    private function attempt(Permit $permit, VerificationResult $result, string $identifierHash, string $reason): VerificationAttempt
    {
        return new VerificationAttempt(
            method: VerificationMethod::StudentNumber,
            result: $result,
            identifierHash: $identifierHash,
            reason: $reason,
            student: $permit->student,
            permit: $permit,
            metadata: [
                'checked_at' => Carbon::now()->toISOString(),
            ],
        );
    }
}
