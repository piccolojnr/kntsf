<?php

namespace App\Actions\Permits;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PaymentStatus;
use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Notifications\Payments\PaymentSuccessfulNotification;
use App\Notifications\Permits\PermitIssuedNotification;
use App\Support\ActiveAcademicPeriod;
use App\Support\AuditEvents;
use App\Support\PaymentReferenceGenerator;
use App\Support\PermitCodeHasher;
use App\Support\PermitSettings;
use App\Support\StudentNotifier;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class IssuePermitAction
{
    public function __construct(
        private readonly GeneratePermitCodeAction $generatePermitCode,
        private readonly PermitCodeHasher $permitCodeHasher,
        private readonly PermitSettings $permitSettings,
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
        private readonly PaymentReferenceGenerator $paymentReferenceGenerator,
        private readonly ActiveAcademicPeriod $activeAcademicPeriod,
    ) {}

    /**
     * @param  array{student_email?: string|null, academic_period_id?: int|null, starts_at?: CarbonInterface|string|null, expires_at?: CarbonInterface|string|null, amount_paid?: numeric-string|int|float|null, currency?: string|null, create_payment?: bool|null}  $attributes
     */
    public function handle(Student $student, User $issuedBy, array $attributes = []): IssuedPermit
    {
        return DB::transaction(function () use ($student, $issuedBy, $attributes): IssuedPermit {
            $academicPeriod = $this->academicPeriod($attributes['academic_period_id'] ?? null);

            $duplicateExists = Permit::query()
                ->where('student_id', $student->id)
                ->where('academic_period_id', $academicPeriod->id)
                ->where('status', PermitStatus::Active)
                ->lockForUpdate()
                ->exists();

            if ($duplicateExists) {
                throw new RuntimeException('This student already has an active permit for the selected academic period.');
            }

            $settings = $this->permitSettings->all();
            $startsAt = $this->date($attributes['starts_at'] ?? null) ?? now();
            $expiresAt = $this->date($attributes['expires_at'] ?? null)
                ?? $startsAt->copy()->addDays($settings['default_validity_days']);
            $code = $this->generatePermitCode->handle();

            if (array_key_exists('student_email', $attributes) && $student->email !== $attributes['student_email']) {
                $student->forceFill(['email' => $attributes['student_email']])->save();
            }

            $permit = Permit::query()->create([
                'student_id' => $student->id,
                'academic_period_id' => $academicPeriod->id,
                'issued_by_id' => $issuedBy->id,
                'code_hash' => $this->permitCodeHasher->hash($code),
                'code_last4' => $this->permitCodeHasher->lastFour($code),
                'status' => PermitStatus::Active,
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'amount_paid' => $attributes['amount_paid'] ?? $settings['default_amount'],
                'currency' => mb_strtoupper($attributes['currency'] ?? $settings['currency']),
                'metadata' => [],
            ]);

            $this->createAuditLog->handle(
                actor: $issuedBy,
                event: AuditEvents::PermitIssued,
                auditable: $permit,
                subject: $student,
                description: 'Permit issued.',
                metadata: [
                    'academic_period_id' => $academicPeriod->id,
                    'code_last4' => $permit->code_last4,
                ],
                newValues: $permit->only(['student_id', 'academic_period_id', 'status', 'starts_at', 'expires_at', 'amount_paid', 'currency']),
            );

            $this->studentNotifier->notify($student, new PermitIssuedNotification($permit));

            if ($attributes['create_payment'] ?? true) {
                $payment = $this->createManualSuccessfulPayment($permit, $student, $issuedBy);

                $this->studentNotifier->notify($student, new PaymentSuccessfulNotification($payment));
            }

            return new IssuedPermit($permit->load(['student', 'academicPeriod', 'issuedBy']), $code);
        });
    }

    private function createManualSuccessfulPayment(Permit $permit, Student $student, User $createdBy): Payment
    {
        $payment = Payment::query()->create([
            'student_id' => $student->id,
            'permit_id' => $permit->id,
            'reference' => $this->paymentReferenceGenerator->generate(),
            'gateway' => 'manual',
            'status' => PaymentStatus::Success,
            'amount' => $permit->amount_paid,
            'currency' => $permit->currency,
            'paid_at' => now(),
            'verified_at' => now(),
            'metadata' => [
                'source' => 'permit_issue',
                'notes' => 'Created automatically when permit was issued manually.',
            ],
            'created_by_id' => $createdBy->id,
        ]);

        $this->createAuditLog->handle(
            actor: $createdBy,
            event: AuditEvents::PaymentCreated,
            auditable: $payment,
            subject: $student,
            description: 'Manual payment invoice created for issued permit.',
            metadata: [
                'reference' => $payment->reference,
                'permit_id' => $permit->id,
            ],
            newValues: $payment->only(['student_id', 'permit_id', 'reference', 'gateway', 'status', 'amount', 'currency', 'created_by_id']),
        );

        $this->createAuditLog->handle(
            actor: $createdBy,
            event: AuditEvents::PaymentSuccessful,
            auditable: $payment,
            subject: $student,
            description: 'Manual payment invoice marked successful for issued permit.',
            metadata: [
                'reference' => $payment->reference,
                'permit_id' => $permit->id,
            ],
            newValues: $payment->only(['status', 'paid_at', 'verified_at', 'permit_id']),
        );

        return $payment->load(['student', 'permit', 'createdBy']);
    }

    private function academicPeriod(int|string|null $academicPeriodId): AcademicPeriod
    {
        if ($academicPeriodId !== null && $academicPeriodId !== '') {
            return AcademicPeriod::query()->findOrFail($academicPeriodId);
        }

        $academicPeriod = $this->activeAcademicPeriod->get();

        if (! $academicPeriod instanceof AcademicPeriod) {
            throw new RuntimeException('An active academic period is required before issuing permits.');
        }

        return $academicPeriod;
    }

    private function date(CarbonInterface|string|null $value): ?Carbon
    {
        if ($value instanceof CarbonInterface) {
            return Carbon::instance($value->toDateTime());
        }

        return filled($value) ? Carbon::parse($value) : null;
    }
}
