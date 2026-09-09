<?php

namespace App\Actions\Students;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Auth\CreateAccountActivationTokenAction;
use App\Enums\AccountActivationPurpose;
use App\Models\Student;
use App\Models\User;
use App\Notifications\Auth\SetupPasswordNotification;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ActivateStudentAccountAction
{
    public function __construct(
        private readonly CreateAccountActivationTokenAction $createAccountActivationToken,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    public function handle(Student $student, User $activatedBy): User
    {
        if (blank($student->email)) {
            throw ValidationException::withMessages([
                'email' => 'A student email is required before account activation.',
            ]);
        }

        $activation = DB::transaction(function () use ($student, $activatedBy): array {
            $user = $this->resolveUser($student);

            if ($student->user_id !== $user->id) {
                $student->forceFill([
                    'user_id' => $user->id,
                    'updated_by_id' => $activatedBy->id,
                ])->save();
            }

            $user->assignRole('student');

            $tokenData = $this->createAccountActivationToken->handle(
                $user,
                AccountActivationPurpose::SetupPassword,
            );

            Log::info('Student account activation token issued.', [
                'student_id' => $student->id,
                'user_id' => $user->id,
                'activated_by_id' => $activatedBy->id,
            ]);

            $this->createAuditLog->handle(
                actor: $activatedBy,
                event: AuditEvents::StudentAccountActivated,
                auditable: $student,
                subject: $user,
                description: 'Student account activated.',
                metadata: [
                    'student_id' => $student->id,
                    'user_id' => $user->id,
                ],
                newValues: [
                    'user_id' => $user->id,
                ],
            );

            return [
                'user' => $user,
                'token' => $tokenData['token'],
            ];
        });

        $activation['user']->notify(new SetupPasswordNotification($activation['token']));

        return $activation['user'];
    }

    private function resolveUser(Student $student): User
    {
        if ($student->user_id !== null) {
            return $student->user()->firstOrFail();
        }

        $email = mb_strtolower($student->email);

        $existingUser = User::query()->where('email', $email)->first();

        if ($existingUser !== null) {
            $this->ensureUserCanBeLinked($existingUser);

            return $existingUser;
        }

        return User::query()->create([
            'name' => $student->name ?: $student->student_number,
            'email' => $email,
            'password' => null,
        ]);
    }

    private function ensureUserCanBeLinked(User $user): void
    {
        if ($user->student()->exists()) {
            throw ValidationException::withMessages([
                'email' => 'A student profile is already linked to this email address.',
            ]);
        }

        $unsafeRoles = $user->roles()
            ->where('name', '!=', 'student')
            ->exists();

        if ($unsafeRoles) {
            throw ValidationException::withMessages([
                'email' => 'This email belongs to a non-student account and cannot be linked automatically.',
            ]);
        }
    }
}
