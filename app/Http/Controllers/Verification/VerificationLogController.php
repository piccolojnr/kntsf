<?php

namespace App\Http\Controllers\Verification;

use App\Http\Controllers\Controller;
use App\Models\VerificationLog;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VerificationLogController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', VerificationLog::class);

        $logs = VerificationLog::query()
            ->with([
                'student:id,student_number,name,email',
                'permit:id,code_last4,status',
                'verifier:id,name,email',
            ])
            ->latest('created_at')
            ->paginate(15)
            ->through(fn (VerificationLog $log): array => [
                'id' => $log->id,
                'method' => $log->method->value,
                'method_label' => str($log->method->value)->replace('_', ' ')->title()->toString(),
                'result' => $log->result->value,
                'result_label' => str($log->result->value)->replace('_', ' ')->title()->toString(),
                'reason' => $log->reason,
                'created_at' => $log->created_at?->toISOString(),
                'student' => $log->student ? [
                    'id' => $log->student->id,
                    'student_number' => $log->student->student_number,
                    'name' => $log->student->name,
                    'email' => $log->student->email,
                ] : null,
                'permit' => $log->permit ? [
                    'id' => $log->permit->id,
                    'code_last4' => $log->permit->code_last4,
                    'status' => $log->permit->status->value,
                ] : null,
                'verifier' => $log->verifier ? [
                    'id' => $log->verifier->id,
                    'name' => $log->verifier->name,
                    'email' => $log->verifier->email,
                ] : null,
            ]);

        return Inertia::render('verification/logs', [
            'logs' => $logs,
        ]);
    }
}
