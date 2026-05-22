<?php

namespace App\Http\Controllers\PermitRequests;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\PermitRequests\CompletePermitRequestAction;
use App\Enums\PermitRequestReviewStatus;
use App\Enums\StudentVerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\PermitRequests\ReviewPermitRequestRequest;
use App\Models\PermitRequest;
use App\Support\AuditEvents;
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
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', PermitRequest::class);

        $status = $request->string('status')->trim()->toString();
        $search = $request->string('search')->trim()->toString();

        $permitRequests = PermitRequest::query()
            ->with(['student:id,student_number,name,email,phone,course,level,source,verification_status', 'academicPeriod:id,name,academic_year,semester', 'payment:id,reference,status,permit_id'])
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
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
            ],
            'overview' => [
                'total' => PermitRequest::query()->count(),
                'review_required' => PermitRequest::query()->where('requires_review', true)->where('review_status', PermitRequestReviewStatus::PendingReview)->count(),
                'failed' => PermitRequest::query()->where('status', 'failed')->count(),
                'paid' => PermitRequest::query()->where('status', 'paid')->count(),
            ],
        ]);
    }

    public function show(PermitRequest $permitRequest): Response
    {
        Gate::authorize('view', $permitRequest);

        return Inertia::render('permit-requests/show', [
            'permitRequest' => $this->payload($permitRequest->load(['student', 'academicPeriod', 'payment.permit', 'reviewedBy:id,name,email'])),
            'can' => [
                'review' => request()->user()?->can('review', $permitRequest) ?? false,
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
}
