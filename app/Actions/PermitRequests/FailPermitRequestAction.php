<?php

namespace App\Actions\PermitRequests;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PaymentStatus;
use App\Enums\PermitRequestStatus;
use App\Models\PermitRequest;
use App\Notifications\PermitRequestFailedNotification;
use App\Support\AuditEvents;
use App\Support\StudentNotifier;
use Illuminate\Support\Facades\DB;

class FailPermitRequestAction
{
    public function __construct(
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    public function handle(PermitRequest $permitRequest, string $reason): PermitRequest
    {
        return DB::transaction(function () use ($permitRequest, $reason): PermitRequest {
            $permitRequest = PermitRequest::query()
                ->with(['payment', 'student'])
                ->lockForUpdate()
                ->findOrFail($permitRequest->id);

            $oldValues = $permitRequest->only(['status', 'metadata']);

            $permitRequest->forceFill([
                'status' => PermitRequestStatus::Failed,
                'metadata' => array_replace($permitRequest->metadata ?? [], [
                    'failure_reason' => $reason,
                    'failed_at' => now()->toISOString(),
                ]),
            ])->save();

            if ($permitRequest->payment !== null && $permitRequest->payment->status !== PaymentStatus::Success) {
                $permitRequest->payment->forceFill([
                    'status' => PaymentStatus::Failed,
                    'failure_reason' => $reason,
                    'metadata' => array_replace($permitRequest->payment->metadata ?? [], [
                        'failure_reason' => $reason,
                    ]),
                ])->save();
            }

            $this->createAuditLog->handle(
                actor: null,
                event: AuditEvents::PermitRequestFailed,
                auditable: $permitRequest,
                subject: $permitRequest->student,
                description: 'Self-service permit request failed.',
                metadata: [
                    'request_reference' => $permitRequest->request_reference,
                    'reason' => $reason,
                ],
                oldValues: $oldValues,
                newValues: $permitRequest->only(['status', 'metadata']),
            );

            if ($permitRequest->student !== null) {
                $this->studentNotifier->notify($permitRequest->student, new PermitRequestFailedNotification($permitRequest, $reason));
            }

            return $permitRequest->refresh()->load(['student', 'payment', 'academicPeriod']);
        });
    }
}
