<?php

namespace App\Actions\Permits;

use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Support\PermitCodeHasher;
use App\Support\PermitSettings;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class IssuePermitAction
{
    public function __construct(
        private readonly GeneratePermitCodeAction $generatePermitCode,
        private readonly PermitCodeHasher $permitCodeHasher,
        private readonly PermitSettings $permitSettings,
    ) {}

    /**
     * @param  array{student_email?: string|null, academic_period_id?: int|null, starts_at?: CarbonInterface|string|null, expires_at?: CarbonInterface|string|null, amount_paid?: numeric-string|int|float|null, currency?: string|null}  $attributes
     */
    public function handle(Student $student, User $issuedBy, array $attributes = []): IssuedPermit
    {
        return DB::transaction(function () use ($student, $issuedBy, $attributes): IssuedPermit {
            $academicPeriod = $this->academicPeriod($attributes['academic_period_id'] ?? null);

            $duplicateExists = Permit::query()
                ->where('student_id', $student->id)
                ->where('academic_period_id', $academicPeriod->id)
                ->where('status', PermitStatus::Active)
                ->lockForUpdate()
                ->exists();

            if ($duplicateExists) {
                throw new RuntimeException('This student already has an active permit for the selected academic period.');
            }

            $settings = $this->permitSettings->all();
            $startsAt = $this->date($attributes['starts_at'] ?? null) ?? now();
            $expiresAt = $this->date($attributes['expires_at'] ?? null)
                ?? $startsAt->copy()->addDays($settings['default_validity_days']);
            $code = $this->generatePermitCode->handle();

            if (array_key_exists('student_email', $attributes) && $student->email !== $attributes['student_email']) {
                $student->forceFill(['email' => $attributes['student_email']])->save();
            }

            $permit = Permit::query()->create([
                'student_id' => $student->id,
                'academic_period_id' => $academicPeriod->id,
                'issued_by_id' => $issuedBy->id,
                'code_hash' => $this->permitCodeHasher->hash($code),
                'code_last4' => $this->permitCodeHasher->lastFour($code),
                'status' => PermitStatus::Active,
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'amount_paid' => $attributes['amount_paid'] ?? $settings['default_amount'],
                'currency' => mb_strtoupper($attributes['currency'] ?? $settings['currency']),
                'metadata' => [],
            ]);

            return new IssuedPermit($permit->load(['student', 'academicPeriod', 'issuedBy']), $code);
        });
    }

    private function academicPeriod(int|string|null $academicPeriodId): AcademicPeriod
    {
        if ($academicPeriodId !== null && $academicPeriodId !== '') {
            return AcademicPeriod::query()->findOrFail($academicPeriodId);
        }

        $academicPeriod = AcademicPeriod::query()
            ->where('is_active', true)
            ->first();

        if (! $academicPeriod instanceof AcademicPeriod) {
            throw new RuntimeException('An active academic period is required before issuing permits.');
        }

        return $academicPeriod;
    }

    private function date(CarbonInterface|string|null $value): ?Carbon
    {
        if ($value instanceof CarbonInterface) {
            return Carbon::instance($value->toDateTime());
        }

        return filled($value) ? Carbon::parse($value) : null;
    }
}
