<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Verification\CreateVerificationLogAction;
use App\Actions\Verification\VerificationAttempt;
use App\Actions\Verification\VerifyNfcUidAction;
use App\Actions\Verification\VerifyPermitCodeAction;
use App\Actions\Verification\VerifyStudentNumberAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Mobile\VerifyNfcUidRequest;
use App\Http\Requests\Mobile\VerifyPermitCodeRequest;
use App\Http\Requests\Mobile\VerifyStudentNumberRequest;
use App\Http\Resources\Mobile\VerificationResultResource;
use App\Models\VerificationLog;
use App\Support\AuditEvents;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function studentNumber(
        VerifyStudentNumberRequest $request,
        VerifyStudentNumberAction $verifyStudentNumber,
        CreateVerificationLogAction $createVerificationLog,
        CreateAuditLogAction $createAuditLog,
    ): VerificationResultResource {
        $attempt = $verifyStudentNumber->handle($request->validated('student_number'));
        $log = $createVerificationLog->handle($attempt, $request);

        $this->auditVerification($request, $createAuditLog, $log, $attempt);

        return new VerificationResultResource($attempt);
    }

    public function permitCode(
        VerifyPermitCodeRequest $request,
        VerifyPermitCodeAction $verifyPermitCode,
        CreateVerificationLogAction $createVerificationLog,
        CreateAuditLogAction $createAuditLog,
    ): VerificationResultResource {
        $attempt = $verifyPermitCode->handle($request->validated('permit_code'));
        $log = $createVerificationLog->handle($attempt, $request);

        $this->auditVerification($request, $createAuditLog, $log, $attempt);

        return new VerificationResultResource($attempt);
    }

    public function nfc(
        VerifyNfcUidRequest $request,
        VerifyNfcUidAction $verifyNfcUid,
        CreateVerificationLogAction $createVerificationLog,
        CreateAuditLogAction $createAuditLog,
    ): VerificationResultResource {
        $attempt = $verifyNfcUid->handle($request->validated('uid'));
        $log = $createVerificationLog->handle($attempt, $request);

        $this->auditVerification($request, $createAuditLog, $log, $attempt);

        return new VerificationResultResource($attempt);
    }

    private function auditVerification(
        Request $request,
        CreateAuditLogAction $createAuditLog,
        VerificationLog $log,
        VerificationAttempt $attempt,
    ): void {
        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::VerificationPerformed,
            auditable: $log,
            subject: $attempt->student ?? $attempt->permit,
            description: 'Mobile verification performed.',
            metadata: [
                'method' => $attempt->method->value,
                'result' => $attempt->result->value,
                'verification_log_id' => $log->id,
                'source' => 'mobile_api',
            ],
            request: $request,
        );
    }
}
