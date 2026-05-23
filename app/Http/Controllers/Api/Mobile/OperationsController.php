<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Actions\NfcCards\RegisterNfcCardAction;
use App\Actions\NfcCards\ReplaceNfcCardAction;
use App\Actions\NfcCards\RevokeNfcCardAction;
use App\Actions\Permits\IssuePermitAction;
use App\Enums\PermitRequestStatus;
use App\Enums\PermitStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Mobile\IssuePermitRequest;
use App\Http\Requests\Mobile\RegisterNfcCardRequest;
use App\Http\Requests\Mobile\ReplaceNfcCardRequest;
use App\Http\Resources\Mobile\NfcCardResource;
use App\Http\Resources\Mobile\OperationsNfcCardResource;
use App\Http\Resources\Mobile\OperationsPermitResource;
use App\Http\Resources\Mobile\OperationsSummaryResource;
use App\Http\Resources\Mobile\OperationsVerificationLogResource;
use App\Http\Resources\Mobile\PermitResource;
use App\Http\Resources\Mobile\StudentResource;
use App\Models\AcademicPeriod;
use App\Models\NfcCard;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\VerificationLog;
use App\Support\ActiveAcademicPeriod;
use App\Support\DashboardSummary;
use App\Support\PermitSettings;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use RuntimeException;

class OperationsController extends Controller
{
    public function nfcCards(Request $request): AnonymousResourceCollection
    {
        $this->authorizeOperationsRole($request);
        Gate::authorize('viewAny', NfcCard::class);

        $cards = NfcCard::query()
            ->with(['student:id,student_number,name,course,level'])
            ->when($request->filled('status'), fn (Builder $query): Builder => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = $request->string('search')->trim()->toString();

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('uid_last4', 'like', "%{$search}%")
                        ->orWhereHas('student', function (Builder $query) use ($search): void {
                            $query->where('student_number', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate($this->perPage($request))
            ->withQueryString();

        return OperationsNfcCardResource::collection($cards);
    }

    public function permits(Request $request): AnonymousResourceCollection
    {
        $this->authorizeOperationsRole($request);
        Gate::authorize('viewAny', Permit::class);

        $permits = Permit::query()
            ->with([
                'student:id,student_number,name,course,level',
                'academicPeriod:id,name,academic_year,semester,is_active',
            ])
            ->when($request->filled('status'), fn (Builder $query): Builder => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('academic_period_id'), fn (Builder $query): Builder => $query->where('academic_period_id', $request->integer('academic_period_id')))
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = $request->string('search')->trim()->toString();

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('code_last4', 'like', "%{$search}%")
                        ->orWhereHas('student', function (Builder $query) use ($search): void {
                            $query->where('student_number', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate($this->perPage($request))
            ->withQueryString();

        return OperationsPermitResource::collection($permits);
    }

    public function permitOptions(
        Request $request,
        ActiveAcademicPeriod $activeAcademicPeriod,
        PermitSettings $permitSettings,
    ): JsonResponse {
        $this->authorizeOperationsRole($request);
        Gate::authorize('create', Permit::class);

        $settings = $permitSettings->all();
        $academicPeriod = $request->filled('academic_period_id')
            ? AcademicPeriod::query()->findOrFail($request->integer('academic_period_id'))
            : $activeAcademicPeriod->get();

        $student = $request->filled('student_id')
            ? Student::query()->findOrFail($request->integer('student_id'))
            : null;

        $startsAt = $academicPeriod instanceof AcademicPeriod
            ? $this->defaultStartsAt($academicPeriod)
            : now();
        $expiresAt = $academicPeriod instanceof AcademicPeriod
            ? $this->defaultExpiresAt($academicPeriod, $startsAt, $settings['default_validity_days'])
            : $startsAt->copy()->addDays($settings['default_validity_days']);

        return response()->json([
            'data' => [
                'default_amount' => $settings['default_amount'],
                'currency' => $settings['currency'],
                'default_validity_days' => $settings['default_validity_days'],
                'permit_requests_enabled' => $settings['permit_requests_enabled'],
                'default_starts_at' => $startsAt->toISOString(),
                'default_expires_at' => $expiresAt->toISOString(),
                'student_number_prefix' => config('student-options.student_number_prefix'),
                'courses' => config('student-options.courses', []),
                'levels' => config('student-options.levels', []),
                'active_academic_period' => $academicPeriod instanceof AcademicPeriod ? [
                    'id' => $academicPeriod->id,
                    'name' => $academicPeriod->name,
                    'academic_year' => $academicPeriod->academic_year,
                    'semester' => $academicPeriod->semester,
                    'starts_at' => $academicPeriod->starts_at?->toDateString(),
                    'ends_at' => $academicPeriod->ends_at?->toDateString(),
                ] : null,
                'student' => $student instanceof Student ? [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'email' => $student->email,
                    'phone' => $student->phone,
                    'course' => $student->course,
                    'level' => $student->level,
                ] : null,
                'selected_student_state' => $student instanceof Student && $academicPeriod instanceof AcademicPeriod ? [
                    'has_active_permit' => $this->hasActivePermit($student, $academicPeriod),
                    'has_pending_request' => $this->hasOpenPermitRequest($student, $academicPeriod),
                    'missing_email' => blank($student->email),
                    'missing_phone' => blank($student->phone),
                    'blocking_reasons' => $this->permitIssueBlockingReasons($student, $academicPeriod),
                ] : null,
            ],
        ]);
    }

    public function verificationLogs(Request $request): AnonymousResourceCollection
    {
        $this->authorizeOperationsRole($request);
        Gate::authorize('viewAny', VerificationLog::class);

        $logs = VerificationLog::query()
            ->with([
                'student:id,student_number,name',
                'permit:id,status,code_last4',
                'verifier:id,name',
            ])
            ->when($request->filled('method'), fn (Builder $query): Builder => $query->where('method', $request->string('method')->toString()))
            ->when($request->filled('result'), fn (Builder $query): Builder => $query->where('result', $request->string('result')->toString()))
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = $request->string('search')->trim()->toString();

                $query->whereHas('student', function (Builder $query) use ($search): void {
                    $query->where('student_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->latest('created_at')
            ->paginate($this->perPage($request))
            ->withQueryString();

        return OperationsVerificationLogResource::collection($logs);
    }

    public function summary(Request $request, DashboardSummary $dashboardSummary): OperationsSummaryResource
    {
        abort_unless(
            $request->user()?->can('reports.view') || $request->user()?->hasAnyRole(['super_admin', 'admin', 'staff']),
            403,
        );

        $counts = $dashboardSummary->counts();

        return new OperationsSummaryResource([
            'total_students' => $counts['total_students'],
            'active_permits' => $counts['active_permits'],
            'active_nfc_cards' => $counts['active_nfc_cards'],
            'verifications_today' => $counts['verification_attempts_today'],
            'failed_verifications_today' => $counts['failed_verification_attempts_today'],
            'pending_permit_requests' => PermitRequest::query()
                ->whereIn('status', [PermitRequestStatus::Pending, PermitRequestStatus::AwaitingPayment])
                ->count(),
            'paid_not_issued_requests' => $counts['paid_unissued_permit_requests'],
        ]);
    }

    public function searchStudents(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Student::class);

        $search = $request->string('search')->trim()->toString();

        $students = Student::query()
            ->with(['user', 'activeNfcCard'])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where('student_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('student_number')
            ->limit(min(max($request->integer('limit', 20), 1), 50))
            ->get();

        return response()->json([
            'data' => StudentResource::collection($students),
        ]);
    }

    public function showStudent(Student $student): StudentResource
    {
        Gate::authorize('view', $student);

        return new StudentResource($student->load(['user', 'activeNfcCard', 'permits.academicPeriod']));
    }

    public function issuePermit(IssuePermitRequest $request, IssuePermitAction $issuePermit): JsonResponse
    {
        try {
            $issuedPermit = $issuePermit->handle(
                Student::query()->findOrFail($request->integer('student_id')),
                $request->user(),
                $request->validated(),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new PermitResource($issuedPermit->permit->loadMissing(['student', 'academicPeriod', 'issuedBy'])),
            'plain_code' => $issuedPermit->code,
            'message' => 'Permit issued. The permit code is shown once.',
        ], 201);
    }

    public function registerNfcCard(RegisterNfcCardRequest $request, RegisterNfcCardAction $registerNfcCard): JsonResponse
    {
        try {
            $card = $registerNfcCard->handle(
                Student::query()->findOrFail($request->integer('student_id')),
                $request->validated('uid'),
                $request->user(),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new NfcCardResource($card->load(['student', 'createdBy'])),
        ], 201);
    }

    public function replaceNfcCard(ReplaceNfcCardRequest $request, NfcCard $nfcCard, ReplaceNfcCardAction $replaceNfcCard): JsonResponse
    {
        try {
            $card = $replaceNfcCard->handle($nfcCard, $request->validated('uid'), $request->user());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new NfcCardResource($card->load(['student', 'createdBy'])),
        ]);
    }

    public function revokeNfcCard(Request $request, NfcCard $nfcCard, RevokeNfcCardAction $revokeNfcCard): JsonResponse
    {
        Gate::authorize('revoke', $nfcCard);

        try {
            $card = $revokeNfcCard->handle($nfcCard, $request->user());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new NfcCardResource($card->load(['student', 'createdBy'])),
        ]);
    }

    private function perPage(Request $request): int
    {
        return max(1, min($request->integer('per_page', 15), 50));
    }

    private function authorizeOperationsRole(Request $request): void
    {
        abort_unless($request->user()?->hasAnyRole(['super_admin', 'admin', 'staff']), 403);
    }

    private function hasActivePermit(Student $student, AcademicPeriod $academicPeriod): bool
    {
        return Permit::query()
            ->where('student_id', $student->id)
            ->where('academic_period_id', $academicPeriod->id)
            ->where('status', PermitStatus::Active)
            ->where('expires_at', '>', now())
            ->exists();
    }

    private function hasOpenPermitRequest(Student $student, AcademicPeriod $academicPeriod): bool
    {
        return PermitRequest::query()
            ->where('student_id', $student->id)
            ->where('academic_period_id', $academicPeriod->id)
            ->whereIn('status', [
                PermitRequestStatus::Pending,
                PermitRequestStatus::AwaitingPayment,
                PermitRequestStatus::Paid,
                PermitRequestStatus::Issued,
            ])
            ->exists();
    }

    /**
     * @return array<int, string>
     */
    private function permitIssueBlockingReasons(Student $student, AcademicPeriod $academicPeriod): array
    {
        $reasons = [];

        if ($this->hasActivePermit($student, $academicPeriod)) {
            $reasons[] = 'active_permit_exists';
        }

        if ($this->hasOpenPermitRequest($student, $academicPeriod)) {
            $reasons[] = 'open_permit_request_exists';
        }

        return $reasons;
    }

    private function defaultStartsAt(AcademicPeriod $academicPeriod): CarbonInterface
    {
        if ($academicPeriod->starts_at instanceof CarbonInterface && $academicPeriod->starts_at->isFuture()) {
            return Carbon::instance($academicPeriod->starts_at->toDateTime())->startOfDay();
        }

        return now();
    }

    private function defaultExpiresAt(AcademicPeriod $academicPeriod, CarbonInterface $startsAt, int $defaultValidityDays): CarbonInterface
    {
        if ($academicPeriod->ends_at instanceof CarbonInterface) {
            return Carbon::instance($academicPeriod->ends_at->toDateTime())->endOfDay();
        }

        return Carbon::instance($startsAt->toDateTime())->addDays($defaultValidityDays);
    }
}
