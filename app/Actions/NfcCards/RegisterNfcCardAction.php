<?php

namespace App\Actions\NfcCards;

use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use App\Models\Student;
use App\Models\User;
use App\Support\NfcUidHasher;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RegisterNfcCardAction
{
    public function __construct(
        private readonly NfcUidHasher $nfcUidHasher,
    ) {}

    public function handle(Student $student, string $uid, ?User $createdBy = null): NfcCard
    {
        return DB::transaction(function () use ($student, $uid, $createdBy): NfcCard {
            $uidHash = $this->nfcUidHasher->hash($uid);

            if (NfcCard::query()->where('uid_hash', $uidHash)->exists()) {
                throw new RuntimeException('This NFC UID is already assigned to a card.');
            }

            $student->nfcCards()
                ->where('status', NfcCardStatus::Active)
                ->get()
                ->each(fn (NfcCard $card) => $card->forceFill([
                    'status' => NfcCardStatus::Replaced,
                    'deactivated_at' => now(),
                    'replaced_at' => now(),
                ])->save());

            return NfcCard::query()->create([
                'student_id' => $student->id,
                'uid_hash' => $uidHash,
                'uid_last4' => $this->nfcUidHasher->lastFour($uid),
                'status' => NfcCardStatus::Active,
                'issued_at' => now(),
                'activated_at' => now(),
                'created_by_id' => $createdBy?->id,
                'metadata' => [],
            ]);
        });
    }
}
