<?php

namespace App\Support;

final class AuditEvents
{
    public const StudentCreated = 'student.created';

    public const StudentUpdated = 'student.updated';

    public const StudentDeleted = 'student.deleted';

    public const StudentAccountActivated = 'student.account_activated';

    public const PermitIssued = 'permit.issued';

    public const PermitRevoked = 'permit.revoked';

    public const PermitCardDelivered = 'permit.card_delivered';

    public const PaymentCreated = 'payment.created';

    public const PaymentSuccessful = 'payment.successful';

    public const PaymentFailed = 'payment.failed';

    public const PaymentCancelled = 'payment.cancelled';

    public const NfcRegistered = 'nfc.registered';

    public const NfcReplaced = 'nfc.replaced';

    public const NfcLost = 'nfc.lost';

    public const NfcRevoked = 'nfc.revoked';

    public const VerificationPerformed = 'verification.performed';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [
            self::StudentCreated,
            self::StudentUpdated,
            self::StudentDeleted,
            self::StudentAccountActivated,
            self::PermitIssued,
            self::PermitRevoked,
            self::PermitCardDelivered,
            self::PaymentCreated,
            self::PaymentSuccessful,
            self::PaymentFailed,
            self::PaymentCancelled,
            self::NfcRegistered,
            self::NfcReplaced,
            self::NfcLost,
            self::NfcRevoked,
            self::VerificationPerformed,
        ];
    }
}
