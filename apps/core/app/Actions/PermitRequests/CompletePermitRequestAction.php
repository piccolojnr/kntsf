<?php

namespace App\Actions\PermitRequests;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Permits\IssuePermitAction;
use App\Enums\PermitRequestReviewStatus;
use App\Enums\PermitRequestStatus;
use App\Models\PermitRequest;
use App\Models\User;
use App\Notifications\PermitRequestReviewRequiredNotification;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use RuntimeException;

class CompletePermitRequestAction
{
    public function __construct(
        private readonly IssuePermitAction $issuePermit,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    public function handle(PermitRequest $permitRequest, ?User $issuedBy = null): PermitRequest
    {
        return DB::transaction(function () use ($permitRequest, $issuedBy): PermitRequest {
            $permitRequest = PermitRequest::query()
                ->with(['student', 'payment', 'academicPeriod'])
                ->lockForUpdate()
                ->findOrFail($permitRequest->id);

            if ($permitRequest->status === PermitRequestStatus::Issued) {
                return $permitRequest;
            }

            if ($permitRequest->payment === null || $permitRequest->payment->verified_at === null) {
                throw new RuntimeException('Verified payment is required before issuing a permit.');
            }

            if (
                $permitRequest->requires_review
                && $permitRequest->review_status !== PermitRequestReviewStatus::Approved
            ) {
                $permitRequest->forceFill([
                    'status' => PermitRequestStatus::Paid,
                    'review_status' => PermitRequestReviewStatus::PendingReview,
                ])->save();

                $reviewers = User::permission('payments.manage')->get();

                if ($reviewers->isNotEmpty()) {
                    Notification::send($reviewers, new PermitRequestReviewRequiredNotification($permitRequest));
                }

                return $permitRequest->refresh()->load(['student', 'payment', 'academicPeriod']);
            }

            if ($permitRequest->payment->permit_id !== null) {
                $permitRequest->forceFill([
                    'status' => PermitRequestStatus::Issued,
                ])->save();

                return $permitRequest->refresh()->load(['student', 'payment', 'academicPeriod']);
            }

            $issuedPermit = $this->issuePermit->handle($permitRequest->student, $issuedBy, [
                'academic_period_id' => $permitRequest->academic_period_id,
                'amount_paid' => $permitRequest->amount,
                'currency' => $permitRequest->currency,
                'create_payment' => false,
            ]);

            $permitRequest->payment->forceFill([
                'permit_id' => $issuedPermit->permit->id,
            ])->save();

            $permitRequest->forceFill([
                'status' => PermitRequestStatus::Issued,
            ])->save();

            $this->createAuditLog->handle(
                actor: $issuedBy,
                event: AuditEvents::PermitRequestIssued,
                auditable: $permitRequest,
                subject: $permitRequest->student,
                description: 'Self-service permit request issued.',
                metadata: [
                    'request_reference' => $permitRequest->request_reference,
                    'payment_reference' => $permitRequest->payment->reference,
                    'permit_id' => $issuedPermit->permit->id,
                ],
                newValues: [
                    'status' => PermitRequestStatus::Issued->value,
                    'permit_id' => $issuedPermit->permit->id,
                ],
            );

            return $permitRequest->refresh()->load(['student', 'payment.permit', 'academicPeriod']);
        });
    }
}
