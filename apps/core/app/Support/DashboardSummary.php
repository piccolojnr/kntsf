<?php

namespace App\Support;

use App\Enums\NfcCardStatus;
use App\Enums\PaymentStatus;
use App\Enums\PermitStatus;
use App\Enums\PublishStatus;
use App\Enums\VerificationResult;
use App\Models\AcademicPeriod;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Student;
use App\Models\VerificationLog;

class DashboardSummary
{
    public function __construct(
        private readonly PermitSettings $permitSettings,
        private readonly ContentSettings $contentSettings,
    ) {}

    /**
     * @return array<string, int>
     */
    public function counts(): array
    {
        return [
            'total_students' => Student::query()->count(),
            'activated_student_accounts' => Student::query()
                ->whereHas('user', fn ($query) => $query->whereNotNull('password'))
                ->count(),
            'pending_setup_student_accounts' => Student::query()
                ->whereHas('user', fn ($query) => $query->whereNull('password'))
                ->count(),
            'active_permits' => Permit::query()
                ->where('status', PermitStatus::Active)
                ->where('starts_at', '<=', now())
                ->where('expires_at', '>=', now())
                ->count(),
            'expired_permits' => Permit::query()
                ->where(function ($query) {
                    $query->where('status', PermitStatus::Expired)
                        ->orWhere(function ($query) {
                            $query->where('status', PermitStatus::Active)
                                ->where('expires_at', '<', now());
                        });
                })
                ->count(),
            'revoked_permits' => Permit::query()->where('status', PermitStatus::Revoked)->count(),
            'active_nfc_cards' => NfcCard::query()->where('status', NfcCardStatus::Active)->count(),
            'pending_payments' => Payment::query()->where('status', PaymentStatus::Pending)->count(),
            'successful_payments' => Payment::query()->where('status', PaymentStatus::Success)->count(),
            'verification_attempts_today' => VerificationLog::query()
                ->whereDate('created_at', today())
                ->count(),
            'failed_verification_attempts_today' => VerificationLog::query()
                ->whereDate('created_at', today())
                ->where('result', '!=', VerificationResult::Valid)
                ->count(),
        ];
    }

    /**
     * @return array<int, array{key: string, title: string, description: string, severity: string, count?: int}>
     */
    public function warnings(): array
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

        return $warnings;
    }

    /**
     * @return array<int, array{key: string, title: string, description: string, ready: bool}>
     */
    public function contentReadiness(): array
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
                    ? 'Public document publishing is enabled for future document modules.'
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
    public function reports(): array
    {
        $counts = $this->counts();

        return [
            'students' => [
                'total' => $counts['total_students'],
                'activated_accounts' => $counts['activated_student_accounts'],
                'pending_setup' => $counts['pending_setup_student_accounts'],
                'without_active_nfc_cards' => Student::query()
                    ->whereDoesntHave('nfcCards', fn ($query) => $query->where('status', NfcCardStatus::Active))
                    ->count(),
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
                'inactive' => NfcCard::query()->whereNot('status', NfcCardStatus::Active)->count(),
                'lost' => NfcCard::query()->where('status', NfcCardStatus::Lost)->count(),
                'revoked' => NfcCard::query()->where('status', NfcCardStatus::Revoked)->count(),
            ],
            'payments' => [
                'pending' => $counts['pending_payments'],
                'successful' => $counts['successful_payments'],
                'failed' => Payment::query()->where('status', PaymentStatus::Failed)->count(),
                'cancelled' => Payment::query()->where('status', PaymentStatus::Cancelled)->count(),
            ],
            'verification' => [
                'attempts_today' => $counts['verification_attempts_today'],
                'failed_today' => $counts['failed_verification_attempts_today'],
                'valid_today' => VerificationLog::query()
                    ->whereDate('created_at', today())
                    ->where('result', VerificationResult::Valid)
                    ->count(),
                'total_logs' => VerificationLog::query()->count(),
            ],
        ];
    }
}
