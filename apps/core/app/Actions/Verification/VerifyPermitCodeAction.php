<?php

namespace App\Actions\Verification;

use App\Enums\PermitStatus;
use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\Permit;
use App\Support\PermitCodeHasher;
use App\Support\VerificationIdentifierHasher;
use Illuminate\Support\Carbon;

class VerifyPermitCodeAction
{
    public function __construct(
        private readonly PermitCodeHasher $permitCodeHasher,
        private readonly VerificationIdentifierHasher $verificationIdentifierHasher,
    ) {}

    public function handle(string $permitCode): VerificationAttempt
    {
        $identifierHash = $this->verificationIdentifierHasher->hash($permitCode);
        $permitHash = $this->permitCodeHasher->hash($permitCode);

        $permit = Permit::query()
            ->with(['student', 'academicPeriod'])
            ->where('code_hash', $permitHash)
            ->first();

        if (! $permit) {
            return new VerificationAttempt(
                method: VerificationMethod::PermitCode,
                result: VerificationResult::NotFound,
                identifierHash: $identifierHash,
                reason: 'No permit matched the submitted code.',
            );
        }

        return $this->evaluatePermit($permit, $identifierHash);
    }

    private function evaluatePermit(Permit $permit, string $identifierHash): VerificationAttempt
    {
        if ($permit->status === PermitStatus::Revoked) {
            return $this->attempt($permit, VerificationResult::Revoked, $identifierHash, 'Permit has been revoked.');
        }

        if ($permit->status === PermitStatus::Expired || $permit->expires_at->isPast()) {
            if ($permit->status !== PermitStatus::Expired) {
                $permit->forceFill(['status' => PermitStatus::Expired])->save();
            }

            return $this->attempt($permit->refresh(), VerificationResult::Expired, $identifierHash, 'Permit has expired.');
        }

        if ($permit->starts_at->isFuture()) {
            return $this->attempt($permit, VerificationResult::Invalid, $identifierHash, 'Permit is not active yet.');
        }

        return $this->attempt($permit, VerificationResult::Valid, $identifierHash, 'Permit is valid.');
    }

    private function attempt(Permit $permit, VerificationResult $result, string $identifierHash, string $reason): VerificationAttempt
    {
        return new VerificationAttempt(
            method: VerificationMethod::PermitCode,
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
