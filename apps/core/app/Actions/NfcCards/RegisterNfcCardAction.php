<?php

namespace App\Actions\NfcCards;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use App\Models\Student;
use App\Models\User;
use App\Notifications\NfcCards\NfcCardRegisteredNotification;
use App\Support\AuditEvents;
use App\Support\NfcUidHasher;
use App\Support\StudentNotifier;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RegisterNfcCardAction
{
    public function __construct(
        private readonly NfcUidHasher $nfcUidHasher,
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    public function handle(Student $student, string $uid, ?User $createdBy = null, bool $logRegistration = true): NfcCard
    {
        return DB::transaction(function () use ($student, $uid, $createdBy, $logRegistration): NfcCard {
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

            $card = NfcCard::query()->create([
                'student_id' => $student->id,
                'uid_hash' => $uidHash,
                'uid_last4' => $this->nfcUidHasher->lastFour($uid),
                'status' => NfcCardStatus::Active,
                'issued_at' => now(),
                'activated_at' => now(),
                'created_by_id' => $createdBy?->id,
                'metadata' => [],
            ]);

            if ($logRegistration) {
                $this->createAuditLog->handle(
                    actor: $createdBy,
                    event: AuditEvents::NfcRegistered,
                    auditable: $card,
                    subject: $student,
                    description: 'NFC card registered.',
                    metadata: [
                        'uid_last4' => $card->uid_last4,
                    ],
                    newValues: $card->only(['student_id', 'uid_last4', 'status', 'issued_at', 'activated_at', 'created_by_id']),
                );
            }

            $this->studentNotifier->notify($student, new NfcCardRegisteredNotification($card));

            return $card;
        });
    }
}
