<?php

namespace App\Http\Controllers\Payments;

use App\Actions\Payments\CancelPaymentAction;
use App\Actions\Payments\CreateManualPaymentAction;
use App\Actions\Payments\MarkPaymentFailedAction;
use App\Actions\Payments\MarkPaymentSuccessfulAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\StoreManualPaymentRequest;
use App\Http\Requests\Payments\UpdatePaymentStatusRequest;
use App\Models\AcademicPeriod;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Payment::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $payments = Payment::query()
            ->with([
                'student:id,student_number,name,email,course,level',
                'permit:id,code_last4,status,academic_period_id',
                'permit.academicPeriod:id,name,academic_year,semester',
                'createdBy:id,name,email',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where('reference', 'like', "%{$search}%")
                    ->orWhere('gateway_reference', 'like', "%{$search}%")
                    ->orWhereHas('student', function (Builder $query) use ($search) {
                        $query->where('student_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Payment $payment): array => $this->paymentPayload($payment));

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'overview' => [
                'total' => Payment::query()->count(),
                'success' => Payment::query()->where('status', 'success')->count(),
                'pending' => Payment::query()->where('status', 'pending')->count(),
            ],
            'options' => $this->formOptions(),
            'can' => [
                'manage' => $request->user()?->can('payments.manage') ?? false,
            ],
        ]);
    }

    public function store(StoreManualPaymentRequest $request, CreateManualPaymentAction $createManualPayment): RedirectResponse
    {
        try {
            $payment = $createManualPayment->handle(
                Student::query()->findOrFail($request->integer('student_id')),
                $request->user(),
                $request->validated(),
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['payment' => $exception->getMessage()]);
        }

        return to_route('payments.show', $payment);
    }

    public function show(Request $request, Payment $payment): Response
    {
        Gate::authorize('view', $payment);

        return Inertia::render('payments/show', [
            'payment' => $this->paymentPayload($payment->load([
                'student:id,student_number,name,email,course,level',
                'permit:id,code_last4,status,academic_period_id,starts_at,expires_at',
                'permit.academicPeriod:id,name,academic_year,semester',
                'createdBy:id,name,email',
            ])),
            'options' => $this->formOptions(),
            'can' => [
                'manage' => $request->user()?->can('payments.manage') ?? false,
            ],
        ]);
    }

    public function markSuccessful(
        UpdatePaymentStatusRequest $request,
        Payment $payment,
        MarkPaymentSuccessfulAction $markPaymentSuccessful,
    ): RedirectResponse {
        try {
            $markPaymentSuccessful->handle($payment, $request->user(), $request->validated());
        } catch (RuntimeException $exception) {
            return back()->withErrors(['payment' => $exception->getMessage()]);
        }

        return back();
    }

    public function markFailed(
        UpdatePaymentStatusRequest $request,
        Payment $payment,
        MarkPaymentFailedAction $markPaymentFailed,
    ): RedirectResponse {
        try {
            $markPaymentFailed->handle($payment, $request->validated());
        } catch (RuntimeException $exception) {
            return back()->withErrors(['payment' => $exception->getMessage()]);
        }

        return back();
    }

    public function cancel(
        UpdatePaymentStatusRequest $request,
        Payment $payment,
        CancelPaymentAction $cancelPayment,
    ): RedirectResponse {
        try {
            $cancelPayment->handle($payment, $request->validated());
        } catch (RuntimeException $exception) {
            return back()->withErrors(['payment' => $exception->getMessage()]);
        }

        return back();
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        Gate::authorize('delete', $payment);

        $payment->delete();

        return to_route('payments.index');
    }

    private function paymentPayload(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'reference' => $payment->reference,
            'gateway' => $payment->gateway,
            'gateway_reference' => $payment->gateway_reference,
            'status' => $payment->status->value,
            'status_label' => str($payment->status->value)->replace('_', ' ')->title()->toString(),
            'amount' => (string) $payment->amount,
            'currency' => $payment->currency,
            'paid_at' => $payment->paid_at?->toISOString(),
            'verified_at' => $payment->verified_at?->toISOString(),
            'failure_reason' => $payment->failure_reason,
            'student' => [
                'id' => $payment->student->id,
                'student_number' => $payment->student->student_number,
                'name' => $payment->student->name,
                'email' => $payment->student->email,
                'course' => $payment->student->course,
                'level' => $payment->student->level,
            ],
            'permit' => $payment->permit ? [
                'id' => $payment->permit->id,
                'code_last4' => $payment->permit->code_last4,
                'status' => $payment->permit->status->value,
                'academic_period' => $payment->permit->academicPeriod ? [
                    'id' => $payment->permit->academicPeriod->id,
                    'name' => $payment->permit->academicPeriod->name,
                    'academic_year' => $payment->permit->academicPeriod->academic_year,
                    'semester' => $payment->permit->academicPeriod->semester,
                ] : null,
            ] : null,
            'created_by' => $payment->createdBy ? [
                'id' => $payment->createdBy->id,
                'name' => $payment->createdBy->name,
                'email' => $payment->createdBy->email,
            ] : null,
        ];
    }

    private function formOptions(): array
    {
        return [
            'students' => Student::query()
                ->orderBy('student_number')
                ->get(['id', 'student_number', 'name', 'email'])
                ->map(fn (Student $student): array => [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'email' => $student->email,
                    'label' => trim($student->student_number.' - '.($student->name ?? 'Unnamed student')),
                ])
                ->values()
                ->all(),
            'academic_periods' => AcademicPeriod::query()
                ->latest('is_active')
                ->latest('starts_at')
                ->get(['id', 'name', 'academic_year', 'semester', 'is_active'])
                ->map(fn (AcademicPeriod $period): array => [
                    'id' => $period->id,
                    'label' => trim($period->name.' - '.$period->academic_year.($period->semester ? ' '.$period->semester : '')),
                    'is_active' => $period->is_active,
                ])
                ->values()
                ->all(),
        ];
    }
}
