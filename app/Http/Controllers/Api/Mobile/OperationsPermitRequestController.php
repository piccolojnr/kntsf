<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\PermitRequests\CompletePermitRequestAction;
use App\Enums\PermitRequestReviewStatus;
use App\Enums\StudentVerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\PermitRequests\ReviewPermitRequestRequest;
use App\Http\Resources\Mobile\PermitRequestResource;
use App\Models\PermitRequest;
use App\Support\AuditEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use RuntimeException;

class OperationsPermitRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', PermitRequest::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $permitRequests = PermitRequest::query()
            ->with(['student', 'academicPeriod', 'payment.permit.academicPeriod'])
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
            ->paginate(min(max($request->integer('per_page', 10), 1), 50));

        return response()->json([
            'data' => PermitRequestResource::collection($permitRequests->items()),
            'meta' => [
                'current_page' => $permitRequests->currentPage(),
                'last_page' => $permitRequests->lastPage(),
                'per_page' => $permitRequests->perPage(),
                'total' => $permitRequests->total(),
            ],
        ]);
    }

    public function show(PermitRequest $permitRequest): PermitRequestResource
    {
        Gate::authorize('view', $permitRequest);

        return new PermitRequestResource($permitRequest->load(['student', 'academicPeriod', 'payment.permit.academicPeriod']));
    }

    public function approveReview(
        ReviewPermitRequestRequest $request,
        PermitRequest $permitRequest,
        CompletePermitRequestAction $completePermitRequest,
        CreateAuditLogAction $createAuditLog,
    ): PermitRequestResource|JsonResponse {
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
                    description: 'Self-service permit request review approved from mobile operations.',
                    metadata: ['request_reference' => $permitRequest->request_reference],
                    newValues: $permitRequest->only(['review_status', 'reviewed_by_id', 'reviewed_at']),
                );
            });

            $permitRequest = $completePermitRequest->handle($permitRequest->refresh(), $request->user());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return new PermitRequestResource($permitRequest->load(['student', 'academicPeriod', 'payment.permit.academicPeriod']));
    }

    public function rejectReview(
        ReviewPermitRequestRequest $request,
        PermitRequest $permitRequest,
        CreateAuditLogAction $createAuditLog,
    ): PermitRequestResource {
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
                description: 'Self-service permit request review rejected from mobile operations.',
                metadata: ['request_reference' => $permitRequest->request_reference],
                newValues: $permitRequest->only(['review_status', 'reviewed_by_id', 'reviewed_at']),
            );
        });

        return new PermitRequestResource($permitRequest->refresh()->load(['student', 'academicPeriod', 'payment.permit.academicPeriod']));
    }
}
