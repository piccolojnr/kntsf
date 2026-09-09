<?php

namespace App\Support;

final class AuditEvents
{
    public const StudentCreated = 'student.created';

    public const StudentUpdated = 'student.updated';

    public const StudentDeleted = 'student.deleted';

    public const StudentAccountActivated = 'student.account_activated';

    public const StudentsImported = 'students.imported';

    public const PermitIssued = 'permit.issued';

    public const PermitRevoked = 'permit.revoked';

    public const PermitCardDelivered = 'permit.card_delivered';

    public const PermitRequestCreated = 'permit_request.created';

    public const PermitRequestPaymentInitialized = 'permit_request.payment_initialized';

    public const PermitRequestPaymentVerified = 'permit_request.payment_verified';

    public const PermitRequestIssued = 'permit_request.issued';

    public const PermitRequestFailed = 'permit_request.failed';

    public const PermitRequestReviewApproved = 'permit_request.review_approved';

    public const PermitRequestReviewRejected = 'permit_request.review_rejected';

    public const PermitRequestVerificationRetried = 'permit_request.verification_retried';

    public const PermitRequestIssuanceRetried = 'permit_request.issuance_retried';

    public const PermitRequestCancelled = 'permit_request.cancelled';

    public const PermitRequestExpired = 'permit_request.expired';

    public const PaymentCreated = 'payment.created';

    public const PaymentSuccessful = 'payment.successful';

    public const PaymentFailed = 'payment.failed';

    public const PaymentCancelled = 'payment.cancelled';

    public const NfcRegistered = 'nfc.registered';

    public const NfcReplaced = 'nfc.replaced';

    public const NfcLost = 'nfc.lost';

    public const NfcRevoked = 'nfc.revoked';

    public const VerificationPerformed = 'verification.performed';

    public const ExecutiveCreated = 'executive.created';

    public const ExecutiveUpdated = 'executive.updated';

    public const ExecutiveDeleted = 'executive.deleted';

    public const ExecutiveActivated = 'executive.activated';

    public const ExecutiveDeactivated = 'executive.deactivated';

    public const ExecutiveSetupLinkSent = 'executive.setup_link_sent';

    public const RoleCreated = 'role.created';

    public const RoleUpdated = 'role.updated';

    public const RoleDeleted = 'role.deleted';

    public const RolePermissionsChanged = 'role.permissions_changed';

    public const AnnouncementCreated = 'announcement.created';

    public const AnnouncementUpdated = 'announcement.updated';

    public const AnnouncementPublished = 'announcement.published';

    public const AnnouncementArchived = 'announcement.archived';

    public const AnnouncementDeleted = 'announcement.deleted';

    public const EventCreated = 'event.created';

    public const EventUpdated = 'event.updated';

    public const EventPublished = 'event.published';

    public const EventArchived = 'event.archived';

    public const EventDeleted = 'event.deleted';

    public const DocumentCreated = 'document.created';

    public const DocumentUpdated = 'document.updated';

    public const DocumentPublished = 'document.published';

    public const DocumentArchived = 'document.archived';

    public const DocumentDeleted = 'document.deleted';

    public const PollCreated = 'poll.created';

    public const PollUpdated = 'poll.updated';

    public const PollPublished = 'poll.published';

    public const PollArchived = 'poll.archived';

    public const PollDeleted = 'poll.deleted';

    public const PollVoteCast = 'poll.vote_cast';

    public const PollOptionMerged = 'poll.option_merged';

    public const ElectionCreated = 'election.created';

    public const ElectionUpdated = 'election.updated';

    public const ElectionPublished = 'election.published';

    public const ElectionStarted = 'election.started';

    public const ElectionClosed = 'election.closed';

    public const ElectionArchived = 'election.archived';

    public const ElectionPositionCreated = 'election.position_created';

    public const ElectionPositionUpdated = 'election.position_updated';

    public const ElectionPositionDeleted = 'election.position_deleted';

    public const CandidateCreated = 'candidate.created';

    public const CandidateUpdated = 'candidate.updated';

    public const CandidateApproved = 'candidate.approved';

    public const CandidateRejected = 'candidate.rejected';

    public const CandidateWithdrawn = 'candidate.withdrawn';

    public const ElectionVoteCast = 'election.vote_cast';

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
            self::StudentsImported,
            self::PermitIssued,
            self::PermitRevoked,
            self::PermitCardDelivered,
            self::PermitRequestCreated,
            self::PermitRequestPaymentInitialized,
            self::PermitRequestPaymentVerified,
            self::PermitRequestIssued,
            self::PermitRequestFailed,
            self::PermitRequestReviewApproved,
            self::PermitRequestReviewRejected,
            self::PermitRequestVerificationRetried,
            self::PermitRequestIssuanceRetried,
            self::PermitRequestCancelled,
            self::PermitRequestExpired,
            self::PaymentCreated,
            self::PaymentSuccessful,
            self::PaymentFailed,
            self::PaymentCancelled,
            self::NfcRegistered,
            self::NfcReplaced,
            self::NfcLost,
            self::NfcRevoked,
            self::VerificationPerformed,
            self::ExecutiveCreated,
            self::ExecutiveUpdated,
            self::ExecutiveDeleted,
            self::ExecutiveActivated,
            self::ExecutiveDeactivated,
            self::ExecutiveSetupLinkSent,
            self::RoleCreated,
            self::RoleUpdated,
            self::RoleDeleted,
            self::RolePermissionsChanged,
            self::AnnouncementCreated,
            self::AnnouncementUpdated,
            self::AnnouncementPublished,
            self::AnnouncementArchived,
            self::AnnouncementDeleted,
            self::EventCreated,
            self::EventUpdated,
            self::EventPublished,
            self::EventArchived,
            self::EventDeleted,
            self::DocumentCreated,
            self::DocumentUpdated,
            self::DocumentPublished,
            self::DocumentArchived,
            self::DocumentDeleted,
            self::PollCreated,
            self::PollUpdated,
            self::PollPublished,
            self::PollArchived,
            self::PollDeleted,
            self::PollVoteCast,
            self::PollOptionMerged,
            self::ElectionCreated,
            self::ElectionUpdated,
            self::ElectionPublished,
            self::ElectionStarted,
            self::ElectionClosed,
            self::ElectionArchived,
            self::ElectionPositionCreated,
            self::ElectionPositionUpdated,
            self::ElectionPositionDeleted,
            self::CandidateCreated,
            self::CandidateUpdated,
            self::CandidateApproved,
            self::CandidateRejected,
            self::CandidateWithdrawn,
            self::ElectionVoteCast,
        ];
    }
}
