<?php

namespace App\Actions\Payments;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Permits\IssuePermitAction;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use App\Notifications\Payments\PaymentDueNotification;
use App\Notifications\Payments\PaymentSuccessfulNotification;
use App\Support\AuditEvents;
use App\Support\PaymentReferenceGenerator;
use App\Support\StudentNotifier;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreateManualPaymentAction
{
    public function __construct(
        private readonly PaymentReferenceGenerator $paymentReferenceGenerator,
        private readonly IssuePermitAction $issuePermit,
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    /**
     * @param  array{amount: numeric-string|int|float, student_email?: string|null, currency?: string|null, status?: string|null, issue_permit?: bool|null, academic_period_id?: int|null, notes?: string|null}  $attributes
     */
    public function handle(Student $student, User $createdBy, array $attributes): Payment
    {
        return DB::transaction(function () use ($student, $createdBy, $attributes): Payment {
            $status = PaymentStatus::tryFrom((string) ($attributes['status'] ?? PaymentStatus::Pending->value))
                ?? PaymentStatus::Pending;

            if (! in_array($status, [PaymentStatus::Pending, PaymentStatus::Success], true)) {
                throw new RuntimeException('Manual payments can only be created as pending or successful.');
            }

            if (array_key_exists('student_email', $attributes) && $student->email !== $attributes['student_email']) {
                $student->forceFill(['email' => $attributes['student_email']])->save();
            }

            $payment = Payment::query()->create([
                'student_id' => $student->id,
                'reference' => $this->paymentReferenceGenerator->generate(),
                'gateway' => 'manual',
                'status' => $status,
                'amount' => $attributes['amount'],
                'currency' => mb_strtoupper((string) ($attributes['currency'] ?? 'GHS')),
                'paid_at' => $status === PaymentStatus::Success ? now() : null,
                'verified_at' => $status === PaymentStatus::Success ? now() : null,
                'metadata' => [
                    'notes' => $attributes['notes'] ?? null,
                ],
                'created_by_id' => $createdBy->id,
            ]);

            $this->createAuditLog->handle(
                actor: $createdBy,
                event: AuditEvents::PaymentCreated,
                auditable: $payment,
                subject: $student,
                description: 'Manual payment created.',
                metadata: [
                    'reference' => $payment->reference,
                ],
                newValues: $payment->only(['student_id', 'reference', 'gateway', 'status', 'amount', 'currency', 'created_by_id']),
            );

            if ($status === PaymentStatus::Success && ($attributes['issue_permit'] ?? false)) {
                $issuedPermit = $this->issuePermit->handle($student, $createdBy, [
                    'academic_period_id' => $attributes['academic_period_id'] ?? null,
                    'amount_paid' => $payment->amount,
                    'currency' => $payment->currency,
                ]);

                $payment->forceFill([
                    'permit_id' => $issuedPermit->permit->id,
                ])->save();
            }

            if ($status === PaymentStatus::Success) {
                $this->createAuditLog->handle(
                    actor: $createdBy,
                    event: AuditEvents::PaymentSuccessful,
                    auditable: $payment,
                    subject: $student,
                    description: 'Manual payment marked successful.',
                    metadata: [
                        'reference' => $payment->reference,
                        'permit_id' => $payment->permit_id,
                    ],
                    newValues: $payment->only(['status', 'paid_at', 'verified_at', 'permit_id']),
                );

                $this->studentNotifier->notify($student, new PaymentSuccessfulNotification($payment->refresh()));
            } else {
                $this->studentNotifier->notify($student, new PaymentDueNotification($payment));
            }

            return $payment->refresh()->load(['student', 'permit', 'createdBy']);
        });
    }
}
