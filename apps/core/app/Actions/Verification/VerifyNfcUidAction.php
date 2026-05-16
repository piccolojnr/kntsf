<?php

namespace App\Actions\Verification;

use App\Enums\NfcCardStatus;
use App\Enums\PermitStatus;
use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\NfcCard;
use App\Models\Permit;
use App\Support\ActiveAcademicPeriod;
use App\Support\NfcUidHasher;
use Illuminate\Support\Carbon;

class VerifyNfcUidAction
{
    public function __construct(
        private readonly NfcUidHasher $nfcUidHasher,
        private readonly ActiveAcademicPeriod $activeAcademicPeriod,
    ) {}

    public function handle(string $uid): VerificationAttempt
    {
        $identifierHash = $this->nfcUidHasher->hash($uid);

        $card = NfcCard::query()
            ->with(['student'])
            ->where('uid_hash', $identifierHash)
            ->first();

        if (! $card) {
            return new VerificationAttempt(
                method: VerificationMethod::Nfc,
                result: VerificationResult::NotFound,
                identifierHash: $identifierHash,
                reason: 'No NFC card matched the submitted UID.',
            );
        }

        if ($card->status !== NfcCardStatus::Active) {
            return new VerificationAttempt(
                method: VerificationMethod::Nfc,
                result: VerificationResult::CardInactive,
                identifierHash: $identifierHash,
                reason: 'NFC card is not active.',
                student: $card->student,
                metadata: [
                    'nfc_card_id' => $card->id,
                    'nfc_card_status' => $card->status->value,
                ],
            );
        }

        $activePeriod = $this->activeAcademicPeriod->get();

        $permit = $card->student->permits()
            ->with('academicPeriod')
            ->when($activePeriod, fn ($query) => $query->where('academic_period_id', $activePeriod->id))
            ->latest()
            ->first();

        if (! $permit) {
            return new VerificationAttempt(
                method: VerificationMethod::Nfc,
                result: VerificationResult::NotFound,
                identifierHash: $identifierHash,
                reason: $activePeriod
                    ? 'No permit was found for the active academic period.'
                    : 'No permit was found for this NFC card student.',
                student: $card->student,
                metadata: [
                    'nfc_card_id' => $card->id,
                    'active_academic_period_id' => $activePeriod?->id,
                ],
            );
        }

        return $this->evaluatePermit($permit, $identifierHash, $card->id);
    }

    private function evaluatePermit(Permit $permit, string $identifierHash, int $nfcCardId): VerificationAttempt
    {
        if ($permit->status === PermitStatus::Revoked) {
            return $this->attempt($permit, VerificationResult::Revoked, $identifierHash, $nfcCardId, 'Student permit has been revoked.');
        }

        if ($permit->status === PermitStatus::Expired || $permit->expires_at->isPast()) {
            if ($permit->status !== PermitStatus::Expired) {
                $permit->forceFill(['status' => PermitStatus::Expired])->save();
            }

            return $this->attempt($permit->refresh(), VerificationResult::Expired, $identifierHash, $nfcCardId, 'Student permit has expired.');
        }

        if ($permit->starts_at->isFuture()) {
            return $this->attempt($permit, VerificationResult::Invalid, $identifierHash, $nfcCardId, 'Student permit is not active yet.');
        }

        return $this->attempt($permit, VerificationResult::Valid, $identifierHash, $nfcCardId, 'NFC card and student permit are valid.');
    }

    private function attempt(Permit $permit, VerificationResult $result, string $identifierHash, int $nfcCardId, string $reason): VerificationAttempt
    {
        return new VerificationAttempt(
            method: VerificationMethod::Nfc,
            result: $result,
            identifierHash: $identifierHash,
            reason: $reason,
            student: $permit->student,
            permit: $permit,
            metadata: [
                'checked_at' => Carbon::now()->toISOString(),
                'nfc_card_id' => $nfcCardId,
            ],
        );
    }
}
