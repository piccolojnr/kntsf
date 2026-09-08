<?php

use App\Support\DashboardSummary;
use App\Support\ExecutiveReport;
use App\Support\ReportPeriod;

test('dashboard reports reuse the summary counts computed for the request', function () {
    $counts = [
        'total_students' => 1,
        'activated_student_accounts' => 1,
        'pending_setup_student_accounts' => 0,
        'active_permits' => 1,
        'expired_permits' => 0,
        'revoked_permits' => 0,
        'active_nfc_cards' => 1,
        'pending_payments' => 0,
        'successful_payments' => 1,
        'verification_attempts_today' => 1,
        'failed_verification_attempts_today' => 0,
        'verification_attempts' => 1,
        'failed_verification_attempts' => 0,
        'active_elections' => 0,
        'pending_candidates' => 0,
        'election_votes_today' => 0,
        'election_votes' => 0,
        'stuck_permit_requests' => 0,
        'paid_unissued_permit_requests' => 0,
    ];
    $reports = ['students' => ['total' => 1]];

    $this->mock(ExecutiveReport::class, function ($mock) use ($counts, $reports): void {
        $mock->shouldReceive('counts')
            ->once()
            ->andReturn($counts);
        $mock->shouldReceive('reports')
            ->once()
            ->withArgs(fn (ReportPeriod $period, array $summary): bool => $summary === $counts)
            ->andReturn($reports);
    });

    $summary = app(DashboardSummary::class);
    $period = ReportPeriod::all();
    $requestCounts = $summary->counts($period);

    expect($summary->reports($period, $requestCounts))->toBe($reports);
});
