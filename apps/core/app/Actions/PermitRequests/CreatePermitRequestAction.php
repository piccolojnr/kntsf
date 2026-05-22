<?php

namespace App\Actions\PermitRequests;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PermitRequestReviewStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\PermitStatus;
use App\Enums\StudentSource;
use App\Enums\StudentVerificationStatus;
use App\Models\AcademicPeriod;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\User;
use App\Support\ActiveAcademicPeriod;
use App\Support\AuditEvents;
use App\Support\PermitRequestReferenceGenerator;
use App\Support\PermitSettings;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreatePermitRequestAction
{
    public function __construct(
        private readonly ActiveAcademicPeriod $activeAcademicPeriod,
        private readonly PermitSettings $permitSettings,
        private readonly PermitRequestReferenceGenerator $referenceGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array{student_number: string, student_exists?: bool|null, name?: string|null, email?: string|null, phone?: string|null, course?: string|null, level?: string|null}  $attributes
     */
    public function handle(array $attributes, ?User $requestedBy = null): PermitRequest
    {
        return DB::transaction(function () use ($attributes, $requestedBy): PermitRequest {
            $settings = $this->permitSettings->all();

            if (! $settings['permit_requests_enabled']) {
                throw new RuntimeException('Self-service permit requests are currently disabled.');
            }

            $academicPeriod = $this->activeAcademicPeriod->get();

            if (! $academicPeriod instanceof AcademicPeriod) {
                throw new RuntimeException('An active academic period is required before requesting permits.');
            }

            $studentNumber = trim($attributes['student_number']);
            $email = filled($attributes['email'] ?? null) ? mb_strtolower(trim((string) $attributes['email'])) : null;
            $phone = filled($attributes['phone'] ?? null) ? trim((string) $attributes['phone']) : null;

            $student = Student::query()
                ->where('student_number', $studentNumber)
                ->lockForUpdate()
                ->first();

            $requiresReview = false;

            if ($student instanceof Student) {
                $this->guardStudentCanRequestPermit($student, $academicPeriod);
                $this->guardExistingStudentContact($student, $email, $phone);

                if ($email !== null && blank($student->email)) {
                    $student->forceFill(['email' => $email])->save();
                }

                if ($phone !== null && blank($student->phone)) {
                    $student->forceFill(['phone' => $phone])->save();
                }
            } else {
                $this->guardEmailOwnership($email);

                $student = Student::query()->create([
                    'student_number' => $studentNumber,
                    'name' => $attributes['name'] ?? null,
                    'email' => $email,
                    'phone' => $phone,
                    'course' => $attributes['course'] ?? null,
                    'level' => $attributes['level'] ?? null,
                    'source' => StudentSource::SelfService,
                    'verification_status' => StudentVerificationStatus::PendingReview,
                    'metadata' => [],
                ]);

                $requiresReview = true;
            }

            $permitRequest = PermitRequest::query()->create([
                'student_id' => $student->id,
                'academic_period_id' => $academicPeriod->id,
                'requested_by_user_id' => $requestedBy?->id,
                'request_reference' => $this->referenceGenerator->generate(),
                'source' => 'self_service',
                'status' => PermitRequestStatus::Pending,
                'amount' => $settings['default_amount'],
                'currency' => $settings['currency'],
                'contact_email' => $email ?? $student->email,
                'contact_phone' => $phone ?? $student->phone,
                'requires_review' => $requiresReview,
                'review_status' => $requiresReview ? PermitRequestReviewStatus::PendingReview : null,
                'expires_at' => now()->addHours(24),
                'metadata' => [
                    'student_preview' => $this->maskedStudentPreview($student),
                ],
            ]);

            $this->createAuditLog->handle(
                actor: $requestedBy,
                event: AuditEvents::PermitRequestCreated,
                auditable: $permitRequest,
                subject: $student,
                description: 'Self-service permit request created.',
                metadata: [
                    'request_reference' => $permitRequest->request_reference,
                    'requires_review' => $permitRequest->requires_review,
                ],
                newValues: $permitRequest->only(['student_id', 'academic_period_id', 'status', 'amount', 'currency', 'requires_review', 'review_status']),
            );

            return $permitRequest->load(['student', 'academicPeriod']);
        });
    }

    /**
     * @return array{name: string|null, student_number: string, course: string|null, level: string|null, has_email: bool, has_phone: bool, can_request: bool, block_reason: string|null}
     */
    public function maskedStudentPreview(Student $student, ?AcademicPeriod $academicPeriod = null): array
    {
        $blockReason = $academicPeriod instanceof AcademicPeriod
            ? $this->studentRequestBlockReason($student, $academicPeriod)
            : null;

        return [
            'name' => $this->maskName($student->name),
            'student_number' => $this->maskStudentNumber($student->student_number),
            'course' => $student->course,
            'level' => $student->level,
            'has_email' => filled($student->email),
            'has_phone' => filled($student->phone),
            'can_request' => $blockReason === null,
            'block_reason' => $blockReason,
        ];
    }

    private function guardStudentCanRequestPermit(Student $student, AcademicPeriod $academicPeriod): void
    {
        $blockReason = $this->studentRequestBlockReason($student, $academicPeriod);

        if ($blockReason !== null) {
            throw new RuntimeException($blockReason);
        }
    }

    private function studentRequestBlockReason(Student $student, AcademicPeriod $academicPeriod): ?string
    {
        $activePermitExists = Permit::query()
            ->where('student_id', $student->id)
            ->where('academic_period_id', $academicPeriod->id)
            ->where('status', PermitStatus::Active)
            ->where('expires_at', '>', now())
            ->exists();

        if ($activePermitExists) {
            return 'This student already has an active permit for the current academic period.';
        }

        $openRequestExists = PermitRequest::query()
            ->where('student_id', $student->id)
            ->where('academic_period_id', $academicPeriod->id)
            ->whereIn('status', [
                PermitRequestStatus::Pending,
                PermitRequestStatus::AwaitingPayment,
                PermitRequestStatus::Paid,
                PermitRequestStatus::Issued,
            ])
            ->exists();

        if ($openRequestExists) {
            return 'This student already has an open permit request for the current academic period.';
        }

        return null;
    }

    private function guardExistingStudentContact(Student $student, ?string $email, ?string $phone): void
    {
        if ($email === null && blank($student->email)) {
            throw new RuntimeException('A contact email is required before requesting a permit.');
        }

        if ($phone === null && blank($student->phone)) {
            throw new RuntimeException('A contact phone number is required before requesting a permit.');
        }

        if ($email !== null && filled($student->email) && mb_strtolower($student->email) !== $email) {
            throw new RuntimeException('This student already has an email on file. Contact administration to change it.');
        }

        $this->guardEmailOwnership($email, $student);
    }

    private function guardEmailOwnership(?string $email, ?Student $currentStudent = null): void
    {
        if ($email === null) {
            return;
        }

        $studentQuery = Student::query()->where('email', $email);

        if ($currentStudent instanceof Student) {
            $studentQuery->whereKeyNot($currentStudent->id);
        }

        $userQuery = User::query()->where('email', $email);

        if ($currentStudent?->user_id !== null) {
            $userQuery->whereKeyNot($currentStudent->user_id);
        }

        if ($studentQuery->exists() || $userQuery->exists()) {
            throw new RuntimeException('This email is already linked to another account or student record.');
        }
    }

    private function maskName(?string $name): ?string
    {
        if (blank($name)) {
            return null;
        }

        return collect(explode(' ', trim($name)))
            ->filter()
            ->map(fn (string $part): string => mb_substr($part, 0, 1).str_repeat('*', max(mb_strlen($part) - 1, 0)))
            ->implode(' ');
    }

    private function maskStudentNumber(string $studentNumber): string
    {
        return mb_substr($studentNumber, 0, 4).str_repeat('*', max(mb_strlen($studentNumber) - 4, 0));
    }
}
