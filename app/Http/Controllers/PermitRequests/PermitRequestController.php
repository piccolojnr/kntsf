<?php

namespace App\Http\Controllers\PermitRequests;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\PermitRequests\CompletePermitRequestAction;
use App\Actions\PermitRequests\VerifyPaystackPaymentAction;
use App\Enums\PermitRequestReviewStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\StudentVerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\PermitRequests\ReviewPermitRequestRequest;
use App\Models\AcademicPeriod;
use App\Models\PermitRequest;
use App\Support\AuditEvents;
use App\Support\PermitRequestRecovery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PermitRequestController extends Controller
{
    public function index(Request $request, PermitRequestRecovery $recovery): Response
    {
        Gate::authorize('viewAny', PermitRequest::class);

        $status = $request->string('status')->trim()->toString();
        $reviewStatus = $request->string('review_status')->trim()->toString();
        $requiresReview = $request->string('requires_review')->trim()->toString();
        $academicPeriodId = $request->string('academic_period')->trim()->toString();
        $dateFrom = $request->date('date_from');
        $dateTo = $request->date('date_to');
        $search = $request->string('search')->trim()->toString();

        $permitRequests = PermitRequest::query()
            ->with(['student:id,student_number,name,email,phone,course,level,source,verification_status', 'academicPeriod:id,name,academic_year,semester', 'payment:id,reference,status,permit_id'])
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($reviewStatus !== '', fn (Builder $query) => $query->where('review_status', $reviewStatus))
            ->when($requiresReview !== '', fn (Builder $query) => $query->where('requires_review', filter_var($requiresReview, FILTER_VALIDATE_BOOL)))
            ->when($academicPeriodId !== '', fn (Builder $query) => $query->where('academic_period_id', $academicPeriodId))
            ->when($dateFrom !== null, fn (Builder $query) => $query->where('created_at', '>=', $dateFrom->startOfDay()))
            ->when($dateTo !== null, fn (Builder $query) => $query->where('created_at', '<=', $dateTo->endOfDay()))
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where('request_reference', 'like', "%{$search}%")
                    ->orWhereHas('student', function (Builder $query) use ($search): void {
                        $query->where('student_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (PermitRequest $permitRequest): array => $this->payload($permitRequest));

        return Inertia::render('permit-requests/index', [
            'permitRequests' => $permitRequests,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'review_status' => $reviewStatus,
                'requires_review' => $requiresReview,
                'academic_period' => $academicPeriodId,
                'date_from' => $dateFrom?->toDateString(),
                'date_to' => $dateTo?->toDateString(),
            ],
            'overview' => [
                'total' => PermitRequest::query()->count(),
                'review_required' => PermitRequest::query()->where('requires_review', true)->where('review_status', PermitRequestReviewStatus::PendingReview)->count(),
                'failed' => PermitRequest::query()->where('status', 'failed')->count(),
                'paid' => PermitRequest::query()->where('status', 'paid')->count(),
                'awaiting_payment' => PermitRequest::query()->where('status', PermitRequestStatus::AwaitingPayment)->count(),
                'issued' => PermitRequest::query()->where('status', PermitRequestStatus::Issued)->count(),
                'expired' => PermitRequest::query()->where('status', PermitRequestStatus::Expired)->count(),
                'stuck' => array_sum($recovery->counts()),
            ],
            'recovery' => $recovery->counts(),
            'academicPeriods' => AcademicPeriod::query()
                ->latest('is_active')
                ->latest('starts_at')
                ->get(['id', 'name', 'academic_year', 'semester'])
                ->map(fn (AcademicPeriod $period): array => [
                    'id' => $period->id,
                    'label' => trim($period->name.' '.$period->academic_year.' '.($period->semester ?? '')),
                ]),
        ]);
    }

    public function show(PermitRequest $permitRequest): Response
    {
        Gate::authorize('view', $permitRequest);

        return Inertia::render('permit-requests/show', [
            'permitRequest' => $this->payload($permitRequest->load(['student', 'academicPeriod', 'payment.permit', 'reviewedBy:id,name,email'])),
            'can' => [
                'review' => request()->user()?->can('review', $permitRequest) ?? false,
                'recover' => request()->user()?->can('review', $permitRequest) ?? false,
            ],
        ]);
    }

    public function approveReview(
        ReviewPermitRequestRequest $request,
        PermitRequest $permitRequest,
        CompletePermitRequestAction $completePermitRequest,
        CreateAuditLogAction $createAuditLog,
    ): RedirectResponse {
        try {
            DB::transaction(function () use ($request, $permitRequest, $createAuditLog): void {
                $permitRequest = PermitRequest::query()->with('student')->lockForUpdate()->findOrFail($permitRequest->id);
                $student = $permitRequest->student;

                $student?->forceFill([
                    'verification_status' => StudentVerificationStatus::Verified,
                    'verified_at' => now(),
                    'verified_by_id' => $request->user()->id,
                    'review_notes' => $request->validated('review_notes'),
                ])->save();

                $permitRequest->forceFill([
                    'review_status' => PermitRequestReviewStatus::Approved,
                    'reviewed_by_id' => $request->user()->id,
                    'reviewed_at' => now(),
                ])->save();

                $createAuditLog->handle(
                    actor: $request->user(),
                    event: AuditEvents::PermitRequestReviewApproved,
                    auditable: $permitRequest,
                    subject: $student,
                    description: 'Self-service permit request review approved.',
                    metadata: ['request_reference' => $permitRequest->request_reference],
                    newValues: $permitRequest->only(['review_status', 'reviewed_by_id', 'reviewed_at']),
                );
            });

            $completePermitRequest->handle($permitRequest->refresh(), $request->user());
        } catch (RuntimeException $exception) {
            return back()->withErrors(['permit_request' => $exception->getMessage()]);
        }

        return back();
    }

    public function retryVerification(
        Request $request,
        PermitRequest $permitRequest,
        VerifyPaystackPaymentAction $verifyPaystackPayment,
        CreateAuditLogAction $createAuditLog,
    ): RedirectResponse {
        Gate::authorize('review', $permitRequest);

        if ($permitRequest->payment === null) {
            return back()->withErrors(['permit_request' => 'This permit request does not have a payment to verify.']);
        }

        try {
            $verifyPaystackPayment->handle($permitRequest->payment->reference);

            $createAuditLog->handle(
                actor: $request->user(),
                event: AuditEvents::PermitRequestVerificationRetried,
                auditable: $permitRequest,
                subject: $permitRequest->student,
                description: 'Permit request payment verification retried by admin.',
                metadata: ['request_reference' => $permitRequest->request_reference],
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['permit_request' => $exception->getMessage()]);
        }

        return back();
    }

    public function retryIssuance(
        Request $request,
        PermitRequest $permitRequest,
        CompletePermitRequestAction $completePermitRequest,
        CreateAuditLogAction $createAuditLog,
    ): RedirectResponse {
        Gate::authorize('review', $permitRequest);

        $permitRequest->loadMissing('payment');

        if (
            $permitRequest->payment === null
            || $permitRequest->payment->verified_at === null
            || $permitRequest->payment->status?->value !== 'success'
        ) {
            return back()->withErrors(['permit_request' => 'Verified payment is required before retrying permit issuance.']);
        }

        try {
            $completePermitRequest->handle($permitRequest, $request->user());

            $createAuditLog->handle(
                actor: $request->user(),
                event: AuditEvents::PermitRequestIssuanceRetried,
                auditable: $permitRequest,
                subject: $permitRequest->student,
                description: 'Permit request issuance retried by admin.',
                metadata: ['request_reference' => $permitRequest->request_reference],
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['permit_request' => $exception->getMessage()]);
        }

        return back();
    }

    public function cancel(Request $request, PermitRequest $permitRequest, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('review', $permitRequest);

        if (in_array($permitRequest->status, [PermitRequestStatus::Issued, PermitRequestStatus::Cancelled], true)) {
            return back()->withErrors(['permit_request' => 'This permit request cannot be cancelled.']);
        }

        $oldValues = $permitRequest->only(['status']);

        $permitRequest->forceFill([
            'status' => PermitRequestStatus::Cancelled,
        ])->save();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::PermitRequestCancelled,
            auditable: $permitRequest,
            subject: $permitRequest->student,
            description: 'Permit request cancelled by admin.',
            metadata: ['request_reference' => $permitRequest->request_reference],
            oldValues: $oldValues,
            newValues: $permitRequest->only(['status']),
        );

        return back();
    }

    public function markExpired(Request $request, PermitRequest $permitRequest, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('review', $permitRequest);

        if (! in_array($permitRequest->status, [PermitRequestStatus::Pending, PermitRequestStatus::AwaitingPayment], true)) {
            return back()->withErrors(['permit_request' => 'Only unpaid pending requests can be marked expired.']);
        }

        $oldValues = $permitRequest->only(['status']);

        $permitRequest->forceFill([
            'status' => PermitRequestStatus::Expired,
        ])->save();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::PermitRequestExpired,
            auditable: $permitRequest,
            subject: $permitRequest->student,
            description: 'Permit request marked expired by admin.',
            metadata: ['request_reference' => $permitRequest->request_reference],
            oldValues: $oldValues,
            newValues: $permitRequest->only(['status']),
        );

        return back();
    }

    public function rejectReview(
        ReviewPermitRequestRequest $request,
        PermitRequest $permitRequest,
        CreateAuditLogAction $createAuditLog,
    ): RedirectResponse {
        DB::transaction(function () use ($request, $permitRequest, $createAuditLog): void {
            $permitRequest = PermitRequest::query()->with('student')->lockForUpdate()->findOrFail($permitRequest->id);
            $student = $permitRequest->student;

            $student?->forceFill([
                'verification_status' => StudentVerificationStatus::Rejected,
                'review_notes' => $request->validated('review_notes'),
            ])->save();

            $permitRequest->forceFill([
                'review_status' => PermitRequestReviewStatus::Rejected,
                'reviewed_by_id' => $request->user()->id,
                'reviewed_at' => now(),
            ])->save();

            $createAuditLog->handle(
                actor: $request->user(),
                event: AuditEvents::PermitRequestReviewRejected,
                auditable: $permitRequest,
                subject: $student,
                description: 'Self-service permit request review rejected.',
                metadata: ['request_reference' => $permitRequest->request_reference],
                newValues: $permitRequest->only(['review_status', 'reviewed_by_id', 'reviewed_at']),
            );
        });

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(PermitRequest $permitRequest): array
    {
        return [
            'id' => $permitRequest->id,
            'reference' => $permitRequest->request_reference,
            'source' => $permitRequest->source,
            'status' => $permitRequest->status->value,
            'amount' => (string) $permitRequest->amount,
            'currency' => $permitRequest->currency,
            'contact_email' => $permitRequest->contact_email,
            'contact_phone' => $permitRequest->contact_phone,
            'requires_review' => $permitRequest->requires_review,
            'review_status' => $permitRequest->review_status?->value,
            'reviewed_at' => $permitRequest->reviewed_at?->toISOString(),
            'created_at' => $permitRequest->created_at?->toISOString(),
            'metadata' => $permitRequest->metadata,
            'recovery_state' => $this->recoveryState($permitRequest),
            'student' => $permitRequest->student ? [
                'id' => $permitRequest->student->id,
                'student_number' => $permitRequest->student->student_number,
                'name' => $permitRequest->student->name,
                'email' => $permitRequest->student->email,
                'phone' => $permitRequest->student->phone,
                'course' => $permitRequest->student->course,
                'level' => $permitRequest->student->level,
                'source' => $permitRequest->student->source?->value,
                'verification_status' => $permitRequest->student->verification_status?->value,
                'review_notes' => $permitRequest->student->review_notes,
            ] : null,
            'academic_period' => [
                'id' => $permitRequest->academicPeriod->id,
                'name' => $permitRequest->academicPeriod->name,
                'academic_year' => $permitRequest->academicPeriod->academic_year,
                'semester' => $permitRequest->academicPeriod->semester,
            ],
            'payment' => $permitRequest->payment ? [
                'id' => $permitRequest->payment->id,
                'reference' => $permitRequest->payment->reference,
                'status' => $permitRequest->payment->status->value,
                'permit_id' => $permitRequest->payment->permit_id,
                'permit_code_last4' => $permitRequest->payment->permit?->code_last4,
            ] : null,
            'reviewed_by' => $permitRequest->reviewedBy ? [
                'id' => $permitRequest->reviewedBy->id,
                'name' => $permitRequest->reviewedBy->name,
            ] : null,
        ];
    }

    private function recoveryState(PermitRequest $permitRequest): ?string
    {
        if ($permitRequest->status === PermitRequestStatus::Paid) {
            return 'Paid but not issued';
        }

        if ($permitRequest->status === PermitRequestStatus::AwaitingPayment && $permitRequest->expires_at?->isPast()) {
            return 'Payment window expired';
        }

        if ($permitRequest->status === PermitRequestStatus::Failed && $permitRequest->payment?->status?->value === 'success') {
            return 'Payment success but request failed';
        }

        if (
            $permitRequest->payment !== null
            && $permitRequest->payment->status?->value === 'success'
            && $permitRequest->payment->permit_id === null
            && $permitRequest->status !== PermitRequestStatus::Issued
        ) {
            return 'Payment has no permit';
        }

        return null;
    }
}
