<?php

namespace App\Actions\Payments;

use App\Actions\Permits\IssuePermitAction;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use App\Support\PaymentReferenceGenerator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreateManualPaymentAction
{
    public function __construct(
        private readonly PaymentReferenceGenerator $paymentReferenceGenerator,
        private readonly IssuePermitAction $issuePermit,
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

            return $payment->refresh()->load(['student', 'permit', 'createdBy']);
        });
    }
}
