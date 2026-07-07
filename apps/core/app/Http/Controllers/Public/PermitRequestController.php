<?php

namespace App\Http\Controllers\Public;

use App\Actions\PermitRequests\CreatePermitRequestAction;
use App\Actions\PermitRequests\InitializePaystackPaymentAction;
use App\Actions\PermitRequests\VerifyPaystackPaymentAction;
use App\Enums\PermitRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StorePermitRequestRequest;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Support\ActiveAcademicPeriod;
use App\Support\PermitSettings;
use App\Support\StudentOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PermitRequestController extends Controller
{
    public function index(PermitSettings $permitSettings, StudentOptions $studentOptions): Response
    {
        return Inertia::render('public/permit-request/index', [
            'settings' => $this->settingsPayload($permitSettings),
            'studentOptions' => $studentOptions->forFrontend(),
        ]);
    }

    public function store(
        StorePermitRequestRequest $request,
        CreatePermitRequestAction $createPermitRequest,
        InitializePaystackPaymentAction $initializePaystackPayment,
    ): RedirectResponse {
        $validated = $request->validated();
        $existingPermitRequest = $createPermitRequest->openRequestForStudentNumber((string) $validated['student_number']);

        if ($existingPermitRequest instanceof PermitRequest) {
            return $this->resumePermitRequest($existingPermitRequest, $initializePaystackPayment);
        }

        try {
            Log::info('Creating permit request', ['request' => $validated]);
            $permitRequest = $createPermitRequest->handle($validated);
            Log::info('Permit request created', ['permit_request_id' => $permitRequest->id]);
        } catch (RuntimeException $exception) {
            Log::error('Error creating permit request', ['error' => $exception->getMessage(), 'request' => $validated]);

            return back()->withErrors(['permit_request' => $exception->getMessage()])->withInput();
        }

        return $this->resumePermitRequest($permitRequest, $initializePaystackPayment);
    }

    public function show(string $reference): Response
    {
        $permitRequest = PermitRequest::query()
            ->where('request_reference', $reference)
            ->with(['student', 'academicPeriod', 'payment.permit'])
            ->firstOrFail();

        return Inertia::render('public/permit-request/show', [
            'permitRequest' => $this->publicPayload($permitRequest),
        ]);
    }

    public function callback(Request $request, VerifyPaystackPaymentAction $verifyPaystackPayment): RedirectResponse
    {
        $reference = $request->string('reference')->trim()->toString();

        if ($reference === '') {
            abort(404);
        }

        $permitRequest = $verifyPaystackPayment->handle($reference);

        return to_route('public.permit-request.success', $permitRequest->request_reference);
    }

    public function success(string $reference): Response
    {
        $permitRequest = PermitRequest::query()
            ->where('request_reference', $reference)
            ->with(['student', 'academicPeriod', 'payment.permit'])
            ->firstOrFail();

        return Inertia::render('public/permit-request/success', [
            'permitRequest' => $this->publicPayload($permitRequest),
        ]);
    }

    /**
     * @return array{exists: bool, student: array<string, mixed>|null}
     */
    public function preview(
        Request $request,
        CreatePermitRequestAction $createPermitRequest,
        ActiveAcademicPeriod $activeAcademicPeriod,
    ): array {
        $studentNumber = $request->validate([
            'student_number' => ['required', 'string', 'max:50'],
        ])['student_number'];

        $student = Student::query()
            ->where('student_number', $studentNumber)
            ->first();

        $activePeriod = $activeAcademicPeriod->get();
        $studentPreview = $student === null ? null : $createPermitRequest->maskedStudentPreview(
            $student,
            $activePeriod,
        );

        if ($studentPreview !== null && $studentPreview['can_resume_request']) {
            $studentPreview['block_reason'] = match ($studentPreview['open_request_status']) {
                PermitRequestStatus::Paid->value => 'A payment has already been received for this permit request. Continue to check the request status.',
                PermitRequestStatus::Issued->value => 'This permit request has already been issued. Continue to view the permit status.',
                default => 'This student already has an unfinished permit request. Continue it instead of starting over.',
            };
        }

        return [
            'exists' => $student !== null,
            'student' => $studentPreview,
        ];
    }

    private function resumePermitRequest(
        PermitRequest $permitRequest,
        InitializePaystackPaymentAction $initializePaystackPayment,
    ): RedirectResponse {
        if (in_array($permitRequest->status, [PermitRequestStatus::Paid, PermitRequestStatus::Issued], true)) {
            return to_route('public.permit-request.success', $permitRequest->request_reference);
        }

        try {
            $initializePaystackPayment->handle($permitRequest);
            Log::info('Paystack payment initialized for permit request', [
                'permit_request_id' => $permitRequest->id,
            ]);
        } catch (RuntimeException $exception) {
            Log::warning('Could not initialize Paystack payment for resumable permit request', [
                'permit_request_id' => $permitRequest->id,
                'error' => $exception->getMessage(),
            ]);
        }

        return to_route('public.permit-request.show', $permitRequest->request_reference);
    }

    /**
     * @return array<string, mixed>
     */
    private function publicPayload(PermitRequest $permitRequest): array
    {
        $paymentMetadata = $permitRequest->payment?->metadata ?? [];

        return [
            'reference' => $permitRequest->request_reference,
            'status' => $permitRequest->status->value,
            'amount' => (string) $permitRequest->amount,
            'currency' => $permitRequest->currency,
            'contact_email' => $permitRequest->contact_email,
            'requires_review' => $permitRequest->requires_review,
            'review_status' => $permitRequest->review_status?->value,
            'student' => [
                'preview' => $permitRequest->metadata['student_preview'] ?? null,
            ],
            'academic_period' => [
                'name' => $permitRequest->academicPeriod->name,
                'academic_year' => $permitRequest->academicPeriod->academic_year,
                'semester' => $permitRequest->academicPeriod->semester,
            ],
            'payment' => $permitRequest->payment ? [
                'reference' => $permitRequest->payment->reference,
                'status' => $permitRequest->payment->status->value,
                'authorization_url' => $paymentMetadata['paystack_authorization_url'] ?? null,
                'permit_id' => $permitRequest->payment->permit_id,
                'permit_code_last4' => $permitRequest->payment->permit?->code_last4,
            ] : null,
        ];
    }

    /**
     * @return array{permit_requests_enabled: bool, default_amount: float, currency: string}
     */
    private function settingsPayload(PermitSettings $permitSettings): array
    {
        $settings = $permitSettings->all();

        return [
            'permit_requests_enabled' => $settings['permit_requests_enabled'],
            'default_amount' => $settings['default_amount'],
            'currency' => $settings['currency'],
        ];
    }
}
