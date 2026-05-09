<?php

namespace App\Actions\Verification;

use App\Models\VerificationLog;
use Illuminate\Http\Request;

class CreateVerificationLogAction
{
    public function handle(VerificationAttempt $attempt, Request $request): VerificationLog
    {
        return VerificationLog::query()->create([
            'method' => $attempt->method,
            'result' => $attempt->result,
            'identifier_hash' => $attempt->identifierHash,
            'reason' => $attempt->reason,
            'student_id' => $attempt->student?->id,
            'permit_id' => $attempt->permit?->id,
            'verifier_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $attempt->metadata,
        ]);
    }
}
