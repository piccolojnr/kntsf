<?php

namespace App\Support;

use App\Enums\NfcCardStatus;
use App\Enums\PaymentStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\PermitStatus;
use App\Enums\VerificationResult;
use App\Models\AcademicPeriod;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionVote;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\VerificationLog;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

final class ExecutiveReport
{
    /**
     * @return array<string, int>
     */
    public function counts(ReportPeriod $period): array
    {
        return [
            'total_students' => $this->between(Student::query(), $period)->count(),
            'activated_student_accounts' => $this->between(
                Student::query()->whereHas('user', fn (Builder $query) => $query->whereNotNull('password')),
                $period,
            )->count(),
            'pending_setup_student_accounts' => $this->between(
                Student::query()->whereHas('user', fn (Builder $query) => $query->whereNull('password')),
                $period,
            )->count(),
            'active_permits' => $this->activePermits($period)->count(),
            'expired_permits' => $this->expiredPermits($period)->count(),
            'revoked_permits' => $this->revokedPermits($period)->count(),
            'active_nfc_cards' => $this->between(NfcCard::query()->where('status', NfcCardStatus::Active), $period)->count(),
            'pending_payments' => $this->between(Payment::query()->where('status', PaymentStatus::Pending), $period)->count(),
            'successful_payments' => $this->between(Payment::query()->where('status', PaymentStatus::Success), $period, 'paid_at')->count(),
            'verification_attempts_today' => VerificationLog::query()
                ->whereBetween('created_at', [today()->startOfDay(), today()->endOfDay()])
                ->count(),
            'failed_verification_attempts_today' => VerificationLog::query()
                ->whereBetween('created_at', [today()->startOfDay(), today()->endOfDay()])
                ->where('result', '!=', VerificationResult::Valid)
                ->count(),
            'verification_attempts' => $this->between(VerificationLog::query(), $period)->count(),
            'failed_verification_attempts' => $this->between(
                VerificationLog::query()->where('result', '!=', VerificationResult::Valid),
                $period,
            )->count(),
            'active_elections' => $this->between(Election::query()->where('status', 'active'), $period, 'starts_at')->count(),
            'pending_candidates' => $this->between(ElectionCandidate::query()->where('status', 'pending'), $period)->count(),
            'election_votes_today' => ElectionVote::query()
                ->whereBetween('cast_at', [today()->startOfDay(), today()->endOfDay()])
                ->count(),
            'election_votes' => $this->between(ElectionVote::query(), $period, 'cast_at')->count(),
            'stuck_permit_requests' => $this->stuckPermitRequests($period)->count(),
            'paid_unissued_permit_requests' => $this->paidUnissuedPermitRequests($period)->count(),
        ];
    }

    /**
     * @return array<string, array<string, int>>
     */
    /**
     * @param  array<string, int>|null  $counts
     * @return array<string, array<string, int>>
     */
    public function reports(ReportPeriod $period, ?array $counts = null): array
    {
        $counts ??= $this->counts($period);

        return [
            'students' => [
                'total' => $counts['total_students'],
                'activated_accounts' => $counts['activated_student_accounts'],
                'pending_setup' => $counts['pending_setup_student_accounts'],
                'without_active_nfc_cards' => $this->between(
                    Student::query()->whereDoesntHave('nfcCards', fn (Builder $query) => $query->where('status', NfcCardStatus::Active)),
                    $period,
                )->count(),
            ],
            'permits' => [
                'active' => $counts['active_permits'],
                'expired' => $counts['expired_permits'],
                'revoked' => $counts['revoked_permits'],
                'expiring_soon' => Permit::query()
                    ->where('status', PermitStatus::Active)
                    ->whereBetween('expires_at', [now(), now()->addDays(14)])
                    ->count(),
            ],
            'nfc_cards' => [
                'active' => $counts['active_nfc_cards'],
                'inactive' => $this->between(NfcCard::query()->whereNot('status', NfcCardStatus::Active), $period)->count(),
                'lost' => $this->between(NfcCard::query()->where('status', NfcCardStatus::Lost), $period)->count(),
                'revoked' => $this->between(NfcCard::query()->where('status', NfcCardStatus::Revoked), $period)->count(),
            ],
            'payments' => [
                'pending' => $counts['pending_payments'],
                'successful' => $counts['successful_payments'],
                'failed' => $this->between(Payment::query()->where('status', PaymentStatus::Failed), $period)->count(),
                'cancelled' => $this->between(Payment::query()->where('status', PaymentStatus::Cancelled), $period)->count(),
            ],
            'permit_requests' => [
                'pending' => $this->between(PermitRequest::query()->where('status', PermitRequestStatus::Pending), $period)->count(),
                'awaiting_payment' => $this->between(PermitRequest::query()->where('status', PermitRequestStatus::AwaitingPayment), $period)->count(),
                'paid_not_issued' => $counts['paid_unissued_permit_requests'],
                'issued' => $this->between(PermitRequest::query()->where('status', PermitRequestStatus::Issued), $period)->count(),
                'failed_or_expired' => $this->between(
                    PermitRequest::query()->whereIn('status', [PermitRequestStatus::Failed, PermitRequestStatus::Expired]),
                    $period,
                )->count(),
            ],
            'verification' => [
                'attempts' => $counts['verification_attempts'],
                'failed' => $counts['failed_verification_attempts'],
                'valid' => $this->between(VerificationLog::query()->where('result', VerificationResult::Valid), $period)->count(),
                'total_logs' => $this->between(VerificationLog::query(), $period)->count(),
            ],
            'elections' => [
                'active' => $counts['active_elections'],
                'pending_candidates' => $counts['pending_candidates'],
                'votes' => $counts['election_votes'],
                'votes_today' => $counts['election_votes_today'],
            ],
        ];
    }

    /**
     * @return array<int, array{key: int, label: string}>
     */
    public function years(): array
    {
        $years = collect([
            ...Student::query()->selectRaw($this->yearExpression('created_at').' as year')->pluck('year'),
            ...Payment::query()->selectRaw($this->yearExpression('created_at').' as year')->pluck('year'),
            ...Permit::query()->selectRaw($this->yearExpression('created_at').' as year')->pluck('year'),
            now()->year,
        ])
            ->filter()
            ->map(fn (mixed $year): int => (int) $year)
            ->unique()
            ->sortDesc()
            ->values();

        return $years
            ->map(fn (int $year): array => ['key' => $year, 'label' => (string) $year])
            ->all();
    }

    /**
     * @return array<int, array{id: int, name: string, academic_year: string|null}>
     */
    public function academicPeriods(): array
    {
        return AcademicPeriod::query()
            ->orderByDesc('is_active')
            ->orderByDesc('starts_at')
            ->get(['id', 'name', 'academic_year'])
            ->map(fn (AcademicPeriod $period): array => [
                'id' => $period->id,
                'name' => $period->name,
                'academic_year' => $period->academic_year,
            ])
            ->all();
    }

    public function paidUnissuedPermitRequests(ReportPeriod $period): Builder
    {
        return $this->between(
            PermitRequest::query()
                ->whereIn('status', [PermitRequestStatus::Paid, PermitRequestStatus::AwaitingPayment])
                ->whereDoesntHave('payment.permit'),
            $period,
        );
    }

    private function stuckPermitRequests(ReportPeriod $period): Builder
    {
        return $this->between(
            PermitRequest::query()
                ->where(function (Builder $query): void {
                    $query->whereIn('status', [
                        PermitRequestStatus::Paid,
                        PermitRequestStatus::Failed,
                        PermitRequestStatus::Expired,
                    ])->orWhere(function (Builder $query): void {
                        $query->where('status', PermitRequestStatus::AwaitingPayment)
                            ->where('expires_at', '<', now());
                    });
                }),
            $period,
        );
    }

    private function activePermits(ReportPeriod $period): Builder
    {
        $query = Permit::query()->where('status', PermitStatus::Active);

        if ($period->startsAt !== null && $period->endsAt !== null) {
            return $query
                ->where('starts_at', '<=', $period->endsAt)
                ->where('expires_at', '>=', $period->startsAt);
        }

        return $query
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>=', now());
    }

    private function expiredPermits(ReportPeriod $period): Builder
    {
        $query = Permit::query()
            ->where(function (Builder $query): void {
                $query->where('status', PermitStatus::Expired)
                    ->orWhere(function (Builder $query): void {
                        $query->where('status', PermitStatus::Active)
                            ->where('expires_at', '<', now());
                    });
            });

        return $this->between($query, $period, 'expires_at');
    }

    private function revokedPermits(ReportPeriod $period): Builder
    {
        return $this->between(Permit::query()->where('status', PermitStatus::Revoked), $period, 'revoked_at');
    }

    private function between(Builder $query, ReportPeriod $period, string $column = 'created_at'): Builder
    {
        if ($period->startsAt instanceof CarbonInterface) {
            $query->where($column, '>=', $period->startsAt);
        }

        if ($period->endsAt instanceof CarbonInterface) {
            $query->where($column, '<=', $period->endsAt);
        }

        return $query;
    }

    private function yearExpression(string $column): string
    {
        return match (config('database.default')) {
            'pgsql' => "extract(year from {$column})",
            'mysql', 'mariadb' => "year({$column})",
            default => "strftime('%Y', {$column})",
        };
    }
}
