<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Actions\PermitRequests\CreatePermitRequestAction;
use App\Actions\PermitRequests\InitializePaystackPaymentAction;
use App\Actions\PermitRequests\VerifyPaystackPaymentAction;
use App\Enums\PermitRequestStatus;
use App\Enums\PermitStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Mobile\InitializeMobilePermitPaymentRequest;
use App\Http\Requests\Api\Mobile\StoreMobilePermitRequestRequest;
use App\Http\Requests\Api\Mobile\VerifyMobilePermitPaymentRequest;
use App\Http\Resources\Mobile\PermitRequestResource;
use App\Models\AcademicPeriod;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Support\ActiveAcademicPeriod;
use App\Support\PermitSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class PermitRequestController extends Controller
{
    public function options(Request $request, ActiveAcademicPeriod $activeAcademicPeriod, PermitSettings $permitSettings): JsonResponse
    {
        $student = $this->student($request);
        $academicPeriod = $activeAcademicPeriod->get();
        $settings = $permitSettings->all();

        return response()->json([
            'data' => [
                'permit_requests_enabled' => $settings['permit_requests_enabled'],
                'default_amount' => $settings['default_amount'],
                'currency' => $settings['currency'],
                'active_academic_period' => $academicPeriod instanceof AcademicPeriod ? [
                    'id' => $academicPeriod->id,
                    'name' => $academicPeriod->name,
                    'academic_year' => $academicPeriod->academic_year,
                    'semester' => $academicPeriod->semester,
                    'starts_at' => $academicPeriod->starts_at?->toDateString(),
                    'ends_at' => $academicPeriod->ends_at?->toDateString(),
                ] : null,
                'student' => [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'email' => $student->email,
                    'phone' => $student->phone,
                    'course' => $student->course,
                    'level' => $student->level,
                ],
                'has_active_permit' => $academicPeriod instanceof AcademicPeriod && $this->hasActivePermit($student, $academicPeriod),
                'has_pending_request' => $academicPeriod instanceof AcademicPeriod && $this->hasOpenPermitRequest($student, $academicPeriod),
                'missing_email' => blank($student->email),
                'missing_phone' => blank($student->phone),
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $permitRequests = $this->student($request)
            ->permitRequests()
            ->with(['student', 'academicPeriod', 'payment.permit.academicPeriod'])
            ->latest()
            ->paginate(min(max($request->integer('per_page', 10), 1), 25));

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

    public function store(StoreMobilePermitRequestRequest $request, CreatePermitRequestAction $createPermitRequest): JsonResponse
    {
        $student = $this->student($request);

        try {
            $permitRequest = $createPermitRequest->handle([
                'student_exists' => true,
                'student_number' => $student->student_number,
                'email' => $request->validated('contact_email'),
                'phone' => $request->validated('contact_phone'),
            ], $request->user());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new PermitRequestResource($permitRequest->load(['student', 'academicPeriod', 'payment.permit.academicPeriod'])),
        ], 201);
    }

    public function show(Request $request, PermitRequest $permitRequest): PermitRequestResource
    {
        $this->assertOwnPermitRequest($request, $permitRequest);

        return new PermitRequestResource($permitRequest->load(['student', 'academicPeriod', 'payment.permit.academicPeriod']));
    }

    public function initializePayment(
        InitializeMobilePermitPaymentRequest $request,
        PermitRequest $permitRequest,
        InitializePaystackPaymentAction $initializePaystackPayment,
    ): JsonResponse {
        $this->assertOwnPermitRequest($request, $permitRequest);

        if (! in_array($permitRequest->status, [PermitRequestStatus::Pending, PermitRequestStatus::AwaitingPayment], true)) {
            return response()->json([
                'message' => 'Payment cannot be initialized for this permit request state.',
            ], 422);
        }

        try {
            $payment = $initializePaystackPayment->handle(
                $permitRequest,
                $request->validated('callback_url'),
                $request->validated('redirect_url'),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            ...$payment,
            'permit_request_reference' => $permitRequest->request_reference,
        ]);
    }

    public function verifyPayment(
        VerifyMobilePermitPaymentRequest $request,
        PermitRequest $permitRequest,
        VerifyPaystackPaymentAction $verifyPaystackPayment,
    ): PermitRequestResource|JsonResponse {
        $this->assertOwnPermitRequest($request, $permitRequest->loadMissing('payment'));

        if ($permitRequest->payment === null) {
            return response()->json([
                'message' => 'This permit request does not have an initialized payment.',
            ], 422);
        }

        $reference = (string) $request->validated('reference');

        if (! in_array($reference, [$permitRequest->payment->reference, $permitRequest->payment->gateway_reference], true)) {
            return response()->json([
                'message' => 'This payment reference is not linked to the permit request.',
            ], 422);
        }

        try {
            $verifiedPermitRequest = $verifyPaystackPayment->handle($reference);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $this->assertOwnPermitRequest($request, $verifiedPermitRequest);

        return new PermitRequestResource($verifiedPermitRequest->load(['student', 'academicPeriod', 'payment.permit.academicPeriod']));
    }

    private function student(Request $request): Student
    {
        $student = $request->user()?->student;

        abort_unless($student instanceof Student, 403, 'This endpoint is only available to linked student accounts.');

        return $student;
    }

    private function assertOwnPermitRequest(Request $request, PermitRequest $permitRequest): void
    {
        abort_unless($permitRequest->student_id === $this->student($request)->id, 404);
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
}
