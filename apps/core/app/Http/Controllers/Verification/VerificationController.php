<?php

namespace App\Http\Controllers\Verification;

use App\Actions\Verification\CreateVerificationLogAction;
use App\Actions\Verification\VerifyNfcUidAction;
use App\Actions\Verification\VerifyPermitCodeAction;
use App\Actions\Verification\VerifyStudentNumberAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Verification\VerifyNfcUidRequest;
use App\Http\Requests\Verification\VerifyPermitCodeRequest;
use App\Http\Requests\Verification\VerifyStudentNumberRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('verification.perform');

        return Inertia::render('verification/index', [
            'result' => $request->session()->get('verificationResult'),
            'options' => [
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
            ],
            'can' => [
                'view_logs' => $request->user()?->can('verification.view_logs') ?? false,
            ],
        ]);
    }

    public function verifyStudentNumber(
        VerifyStudentNumberRequest $request,
        VerifyStudentNumberAction $verifyStudentNumber,
        CreateVerificationLogAction $createVerificationLog,
    ): RedirectResponse {
        $attempt = $verifyStudentNumber->handle($request->validated('student_number'));

        $createVerificationLog->handle($attempt, $request);

        return back()->with('verificationResult', $attempt->toPayload());
    }

    public function verifyPermitCode(
        VerifyPermitCodeRequest $request,
        VerifyPermitCodeAction $verifyPermitCode,
        CreateVerificationLogAction $createVerificationLog,
    ): RedirectResponse {
        $attempt = $verifyPermitCode->handle($request->validated('permit_code'));

        $createVerificationLog->handle($attempt, $request);

        return back()->with('verificationResult', $attempt->toPayload());
    }

    public function verifyNfcUid(
        VerifyNfcUidRequest $request,
        VerifyNfcUidAction $verifyNfcUid,
        CreateVerificationLogAction $createVerificationLog,
    ): RedirectResponse {
        $attempt = $verifyNfcUid->handle($request->validated('uid'));

        $createVerificationLog->handle($attempt, $request);

        return back()->with('verificationResult', $attempt->toPayload());
    }
}
