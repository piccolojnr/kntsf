<?php

namespace App\Support;

use App\Enums\NfcCardStatus;
use App\Enums\PermitStatus;
use App\Enums\PublishStatus;
use App\Models\AcademicPeriod;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\Event;
use App\Models\Permit;
use App\Models\Student;

class DashboardSummary
{
    public function __construct(
        private readonly PermitSettings $permitSettings,
        private readonly ContentSettings $contentSettings,
        private readonly ApplicationCache $cache,
        private readonly PermitRequestRecovery $permitRequestRecovery,
        private readonly ExecutiveReport $executiveReport,
    ) {}

    /**
     * @return array<string, int>
     */
    public function counts(?ReportPeriod $period = null): array
    {
        $period ??= ReportPeriod::all();

        return $this->cache->remember(ApplicationCache::DashboardCounts, $period->cacheKey(), 60, fn (): array => $this->uncachedCounts($period));
    }

    /**
     * @return array<string, int>
     */
    private function uncachedCounts(ReportPeriod $period): array
    {
        return $this->executiveReport->counts($period);
    }

    /**
     * @return array<int, array{key: string, title: string, description: string, severity: string, count?: int}>
     */
    public function warnings(): array
    {
        return $this->cache->remember(ApplicationCache::DashboardWarnings, 'default', 60, fn (): array => $this->uncachedWarnings());
    }

    /**
     * @return array<int, array{key: string, title: string, description: string, severity: string, count?: int}>
     */
    private function uncachedWarnings(): array
    {
        $warnings = [];

        if (! AcademicPeriod::query()->where('is_active', true)->exists()) {
            $warnings[] = [
                'key' => 'no_active_academic_period',
                'title' => 'No active academic period',
                'description' => 'Permit issuance needs an active academic period unless one is selected manually.',
                'severity' => 'high',
            ];
        }

        if (! $this->permitSettings->all()['permit_requests_enabled']) {
            $warnings[] = [
                'key' => 'permit_requests_disabled',
                'title' => 'Permit requests disabled',
                'description' => 'Student-facing permit request workflows are currently disabled.',
                'severity' => 'medium',
            ];
        }

        $studentsWithoutActivatedAccounts = Student::query()
            ->whereDoesntHave('user', fn ($query) => $query->whereNotNull('password'))
            ->count();

        if ($studentsWithoutActivatedAccounts > 0) {
            $warnings[] = [
                'key' => 'students_without_activated_accounts',
                'title' => 'Students need account activation',
                'description' => 'Some student records do not have fully activated user accounts.',
                'severity' => 'medium',
                'count' => $studentsWithoutActivatedAccounts,
            ];
        }

        $studentsWithoutActiveNfcCards = Student::query()
            ->whereDoesntHave('nfcCards', fn ($query) => $query->where('status', NfcCardStatus::Active))
            ->count();

        if ($studentsWithoutActiveNfcCards > 0) {
            $warnings[] = [
                'key' => 'students_without_active_nfc_cards',
                'title' => 'Students without active NFC cards',
                'description' => 'Some students do not currently have an active NFC card assigned.',
                'severity' => 'medium',
                'count' => $studentsWithoutActiveNfcCards,
            ];
        }

        $permitsExpiringSoon = Permit::query()
            ->where('status', PermitStatus::Active)
            ->whereBetween('expires_at', [now(), now()->addDays(14)])
            ->count();

        if ($permitsExpiringSoon > 0) {
            $warnings[] = [
                'key' => 'permits_expiring_soon',
                'title' => 'Permits expiring soon',
                'description' => 'Active permits will expire within the next 14 days.',
                'severity' => 'low',
                'count' => $permitsExpiringSoon,
            ];
        }

        $stuckPermitRequests = array_sum($this->permitRequestRecovery->counts());

        if ($stuckPermitRequests > 0) {
            $warnings[] = [
                'key' => 'stuck_permit_requests',
                'title' => 'Permit requests need recovery',
                'description' => 'Some self-service permit requests are paid, expired, or failed and need admin review.',
                'severity' => 'high',
                'count' => $stuckPermitRequests,
            ];
        }

        return $warnings;
    }

    /**
     * @return array<int, array{key: string, title: string, description: string, ready: bool}>
     */
    public function contentReadiness(): array
    {
        return $this->cache->remember(ApplicationCache::DashboardContentReadiness, 'default', 120, fn (): array => $this->uncachedContentReadiness());
    }

    /**
     * @return array<int, array{key: string, title: string, description: string, ready: bool}>
     */
    private function uncachedContentReadiness(): array
    {
        $settings = $this->contentSettings->all();

        return [
            [
                'key' => 'news',
                'title' => 'News publishing',
                'description' => $settings['allow_public_news']
                    ? Announcement::query()->where('status', PublishStatus::Published->value)->count().' published announcements, '.Announcement::query()->where('status', PublishStatus::Draft->value)->count().' drafts.'
                    : 'Public news publishing is currently disabled.',
                'ready' => $settings['allow_public_news'],
            ],
            [
                'key' => 'events',
                'title' => 'Event publishing',
                'description' => $settings['allow_public_events']
                    ? Event::query()->where('status', PublishStatus::Published->value)->count().' published events, '.Event::query()->where('status', PublishStatus::Draft->value)->count().' drafts, '.Event::query()->where('status', PublishStatus::Published->value)->where('starts_at', '>=', now())->count().' upcoming.'
                    : 'Public event publishing is currently disabled.',
                'ready' => $settings['allow_public_events'],
            ],
            [
                'key' => 'documents',
                'title' => 'Document publishing',
                'description' => $settings['allow_public_documents']
                    ? Document::query()->where('status', PublishStatus::Published->value)->count().' published documents, '.Document::query()->where('status', PublishStatus::Draft->value)->count().' drafts, '.Document::query()->where('is_featured', true)->count().' featured.'
                    : 'Documents are internal-first until public access is explicitly enabled.',
                'ready' => $settings['allow_public_documents'],
            ],
            [
                'key' => 'featured_announcements',
                'title' => 'Featured announcements',
                'description' => Announcement::query()->where('is_featured', true)->count().' announcements are marked as featured.',
                'ready' => Announcement::query()->where('is_featured', true)->exists(),
            ],
        ];
    }

    /**
     * @return array<string, array<string, int>>
     */
    public function reports(?ReportPeriod $period = null): array
    {
        $period ??= ReportPeriod::all();

        return $this->cache->remember(ApplicationCache::DashboardReports, $period->cacheKey(), 60, fn (): array => $this->uncachedReports($period));
    }

    /**
     * @return array<string, array<string, int>>
     */
    private function uncachedReports(ReportPeriod $period): array
    {
        return $this->executiveReport->reports($period);
    }
}
