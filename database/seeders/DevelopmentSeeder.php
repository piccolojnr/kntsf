<?php

namespace Database\Seeders;

use App\Enums\CandidateStatus;
use App\Enums\ElectionStatus;
use App\Enums\NfcCardStatus;
use App\Enums\PaymentStatus;
use App\Enums\PermitStatus;
use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Enums\Visibility;
use App\Models\AcademicPeriod;
use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Document;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\ElectionVote;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Student;
use App\Models\User;
use App\Models\VerificationLog;
use App\Support\AuditEvents;
use App\Support\NfcUidHasher;
use App\Support\PermitCodeHasher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DevelopmentSeeder extends Seeder
{
    /**
     * Seed a representative local development dataset.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            $this->command?->warn('DevelopmentSeeder is disabled in production.');

            return;
        }

        $this->call([
            RolesAndPermissionsSeeder::class,
            StudentOptionsSeeder::class,
            PermitSettingsSeeder::class,
            ContentSettingsSeeder::class,
        ]);

        DB::transaction(function (): void {
            $users = $this->seedUsers();
            $periods = $this->seedAcademicPeriods();
            $students = $this->seedStudents($users);

            $this->seedExecutiveProfiles($users);
            $permits = $this->seedPermits($students, $periods, $users['admin']);
            $this->seedPayments($students, $permits, $users['admin']);
            $this->seedNfcCards($students, $users['staff']);
            $this->seedContent($users['admin']);
            $this->seedPolls($students, $users['admin']);
            $this->seedElections($students, $periods->firstWhere('is_active', true), $users['admin']);
            $this->seedVerificationLogs($students, $permits, $users['staff']);
            $this->seedAuditLogs($users['admin'], $students, $permits);
        });
    }

    /**
     * @return array<string, User>
     */
    private function seedUsers(): array
    {
        $users = [
            'super_admin' => $this->demoUser('Local Super Admin', 'superadmin@kntsf.test', 'super_admin'),
            'admin' => $this->demoUser('Demo SRC Admin', 'admin@kntsf.test', 'admin'),
            'staff' => $this->demoUser('Demo SRC Staff', 'staff@kntsf.test', 'staff'),
            'executive' => $this->demoUser('Demo SRC Executive', 'executive@kntsf.test', 'admin'),
        ];

        return $users;
    }

    private function demoUser(string $name, string $email, string $role): User
    {
        $user = User::query()->updateOrCreate([
            'email' => $email,
        ], [
            'name' => $name,
            'password' => 'password',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $user->syncRoles([$role]);

        return $user;
    }

    /**
     * @return Collection<int, AcademicPeriod>
     */
    private function seedAcademicPeriods(): Collection
    {
        AcademicPeriod::query()->updateOrCreate([
            'name' => 'First Semester 2025/2026',
            'academic_year' => '2025/2026',
        ], [
            'semester' => 'First Semester',
            'starts_at' => now()->subMonths(2)->startOfMonth()->toDateString(),
            'ends_at' => now()->addMonths(2)->endOfMonth()->toDateString(),
            'is_active' => true,
            'metadata' => ['seeded' => true],
        ]);

        AcademicPeriod::query()->updateOrCreate([
            'name' => 'Second Semester 2025/2026',
            'academic_year' => '2025/2026',
        ], [
            'semester' => 'Second Semester',
            'starts_at' => now()->addMonths(3)->startOfMonth()->toDateString(),
            'ends_at' => now()->addMonths(7)->endOfMonth()->toDateString(),
            'is_active' => false,
            'metadata' => ['seeded' => true],
        ]);

        return AcademicPeriod::query()
            ->where('academic_year', '2025/2026')
            ->orderByDesc('is_active')
            ->get();
    }

    /**
     * @param  array<string, User>  $users
     * @return Collection<int, Student>
     */
    private function seedStudents(array $users): Collection
    {
        $students = collect([
            ['26100001', 'Ama Serwaa Mensah', 'ama.mensah@student.kntsf.test', 'Computer Science', '400', true],
            ['26100002', 'Kojo Asare Boateng', 'kojo.boateng@student.kntsf.test', 'Information Technology', '300', true],
            ['26100003', 'Efua Nkrumah', 'efua.nkrumah@student.kntsf.test', 'Business Administration', '200', true],
            ['26100004', 'Yaw Osei', 'yaw.osei@student.kntsf.test', 'Public Administration', '100', true],
            ['26100005', 'Akua Frimpong', 'akua.frimpong@student.kntsf.test', 'Accounting', '300', false],
            ['26100006', 'Kwame Owusu', 'kwame.owusu@student.kntsf.test', 'Marketing', '200', false],
            ['26100007', 'Abena Darko', 'abena.darko@student.kntsf.test', 'Mass Communication', '400', false],
            ['26100008', 'Kofi Addo', 'kofi.addo@student.kntsf.test', 'Economics', '100', false],
            ['26100009', 'Esi Badu', 'esi.badu@student.kntsf.test', 'Computer Science', '200', false],
            ['26100010', 'Nana Prempeh', 'nana.prempeh@student.kntsf.test', 'Information Technology', '300', false],
            ['26100011', 'Afia Adjei', 'afia.adjei@student.kntsf.test', 'Business Administration', '400', false],
            ['26100012', 'Kweku Sarpong', 'kweku.sarpong@student.kntsf.test', 'Public Administration', '100', false],
        ]);

        return $students->map(function (array $row) use ($users): Student {
            [$number, $name, $email, $course, $level, $activated] = $row;

            $studentUser = null;

            if ($activated) {
                $studentUser = User::query()->updateOrCreate([
                    'email' => $email,
                ], [
                    'name' => $name,
                    'password' => 'password',
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]);
                $studentUser->syncRoles(['student']);
            }

            return Student::query()->updateOrCreate([
                'student_number' => $number,
            ], [
                'user_id' => $studentUser?->id,
                'name' => $name,
                'email' => $email,
                'phone' => '+233 24 '.fake()->unique()->numerify('### ####'),
                'course' => $course,
                'level' => $level,
                'created_by_id' => $users['admin']->id,
                'updated_by_id' => $users['admin']->id,
                'metadata' => ['seeded' => true],
            ]);
        })->values();
    }

    /**
     * @param  array<string, User>  $users
     */
    private function seedExecutiveProfiles(array $users): void
    {
        $profiles = [
            [$users['executive'], 'SRC President', 'Leads the council and coordinates executive priorities.', 1],
            [$users['admin'], 'SRC Administrator', 'Maintains operational records and administrative workflows.', 2],
            [$users['staff'], 'Verification Officer', 'Supports permit, NFC, and verification operations.', 3],
        ];

        foreach ($profiles as [$user, $position, $description, $sortOrder]) {
            ExecutiveProfile::query()->updateOrCreate([
                'user_id' => $user->id,
            ], [
                'position' => $position,
                'position_description' => $description,
                'biography' => 'Demo profile for local development and public portal previews.',
                'category' => 'SRC Executive',
                'sort_order' => $sortOrder,
                'is_published' => true,
                'social_links' => [],
            ]);
        }
    }

    /**
     * @param  Collection<int, Student>  $students
     * @param  Collection<int, AcademicPeriod>  $periods
     * @return Collection<int, Permit>
     */
    private function seedPermits(Collection $students, Collection $periods, User $admin): Collection
    {
        $activePeriod = $periods->firstWhere('is_active', true);
        $hasher = app(PermitCodeHasher::class);

        return $students->take(8)->values()->map(function (Student $student, int $index) use ($activePeriod, $admin, $hasher): Permit {
            $code = 'KNT-DEV-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);
            $status = match ($index) {
                5 => PermitStatus::Expired,
                6 => PermitStatus::Revoked,
                default => PermitStatus::Active,
            };

            return Permit::query()->updateOrCreate([
                'code_hash' => $hasher->hash($code),
            ], [
                'student_id' => $student->id,
                'academic_period_id' => $activePeriod?->id,
                'issued_by_id' => $admin->id,
                'code_last4' => mb_substr($code, -4),
                'status' => $status,
                'starts_at' => now()->subMonth(),
                'expires_at' => $status === PermitStatus::Expired ? now()->subDay() : now()->addMonths(3),
                'amount_paid' => 50,
                'currency' => 'GHS',
                'card_delivered_at' => $index < 4 ? now()->subDays(5) : null,
                'revoked_at' => $status === PermitStatus::Revoked ? now()->subDays(2) : null,
                'revoked_by_id' => $status === PermitStatus::Revoked ? $admin->id : null,
                'revocation_reason' => $status === PermitStatus::Revoked ? 'Demo revoked permit.' : null,
                'metadata' => ['seeded' => true, 'plain_demo_code' => $code],
            ]);
        });
    }

    /**
     * @param  Collection<int, Student>  $students
     * @param  Collection<int, Permit>  $permits
     */
    private function seedPayments(Collection $students, Collection $permits, User $admin): void
    {
        foreach ($permits->take(5)->values() as $index => $permit) {
            Payment::query()->updateOrCreate([
                'reference' => 'PAY-DEV-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
            ], [
                'student_id' => $permit->student_id,
                'permit_id' => $permit->id,
                'gateway' => 'manual',
                'status' => PaymentStatus::Success,
                'amount' => 50,
                'currency' => 'GHS',
                'paid_at' => now()->subDays(8 - $index),
                'verified_at' => now()->subDays(8 - $index),
                'created_by_id' => $admin->id,
                'metadata' => ['seeded' => true],
            ]);
        }

        foreach ($students->slice(8, 2)->values() as $index => $student) {
            Payment::query()->updateOrCreate([
                'reference' => 'PAY-DEV-PENDING-'.($index + 1),
            ], [
                'student_id' => $student->id,
                'gateway' => 'manual',
                'status' => $index === 0 ? PaymentStatus::Pending : PaymentStatus::Failed,
                'amount' => 50,
                'currency' => 'GHS',
                'failure_reason' => $index === 1 ? 'Demo failed payment.' : null,
                'created_by_id' => $admin->id,
                'metadata' => ['seeded' => true],
            ]);
        }
    }

    /**
     * @param  Collection<int, Student>  $students
     */
    private function seedNfcCards(Collection $students, User $staff): void
    {
        $hasher = app(NfcUidHasher::class);

        foreach ($students->take(7)->values() as $index => $student) {
            $uid = '04:A1:B2:C3:'.str_pad(dechex($index + 1), 2, '0', STR_PAD_LEFT);
            $status = match ($index) {
                5 => NfcCardStatus::Lost,
                6 => NfcCardStatus::Revoked,
                default => NfcCardStatus::Active,
            };

            NfcCard::query()->updateOrCreate([
                'uid_hash' => $hasher->hash($uid),
            ], [
                'student_id' => $student->id,
                'uid_last4' => $hasher->lastFour($uid),
                'status' => $status,
                'issued_at' => now()->subWeeks(2),
                'activated_at' => $status === NfcCardStatus::Active ? now()->subWeeks(2) : null,
                'deactivated_at' => $status === NfcCardStatus::Active ? null : now()->subDays(3),
                'lost_at' => $status === NfcCardStatus::Lost ? now()->subDays(3) : null,
                'created_by_id' => $staff->id,
                'metadata' => ['seeded' => true],
            ]);
        }
    }

    private function seedContent(User $author): void
    {
        Announcement::query()->updateOrCreate([
            'slug' => 'src-permit-verification-rollout',
        ], [
            'author_id' => $author->id,
            'title' => 'SRC permit verification rollout',
            'excerpt' => 'A demo announcement showing the public portal and dashboard publishing flow.',
            'content' => 'The SRC permit verification platform is ready for local development testing.',
            'category' => 'SRC',
            'status' => PublishStatus::Published,
            'visibility' => Visibility::Public,
            'is_featured' => true,
            'published_at' => now()->subDays(3),
            'metadata' => ['seeded' => true],
        ]);

        Event::query()->updateOrCreate([
            'slug' => 'src-town-hall-demo',
        ], [
            'organizer_id' => $author->id,
            'title' => 'SRC town hall demo',
            'description' => 'Demo event for checking event listings, detail pages, and public portal layout.',
            'excerpt' => 'A campus town hall for validating the events module.',
            'location' => 'Main Auditorium',
            'category' => 'SRC',
            'status' => PublishStatus::Published,
            'visibility' => Visibility::Public,
            'is_featured' => true,
            'starts_at' => now()->addWeeks(2),
            'ends_at' => now()->addWeeks(2)->addHours(2),
            'published_at' => now()->subDays(2),
            'metadata' => ['seeded' => true],
        ]);

        Document::query()->updateOrCreate([
            'slug' => 'permit-requirements-demo',
        ], [
            'author_id' => $author->id,
            'title' => 'Permit requirements demo',
            'excerpt' => 'A demo public document record without uploaded files.',
            'description' => 'Use this record to validate document listings and document metadata in local development.',
            'category' => 'Permits',
            'status' => PublishStatus::Draft,
            'visibility' => Visibility::Public,
            'is_featured' => true,
            'metadata' => ['seeded' => true],
        ]);
    }

    /**
     * @param  Collection<int, Student>  $students
     */
    private function seedPolls(Collection $students, User $admin): void
    {
        $poll = Poll::query()->updateOrCreate([
            'slug' => 'preferred-src-office-hours',
        ], [
            'created_by_id' => $admin->id,
            'title' => 'Preferred SRC office hours',
            'description' => 'Demo poll for testing voting and results display.',
            'type' => PollType::FixedOptions,
            'status' => PublishStatus::Published,
            'visibility' => Visibility::Internal,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addWeek(),
            'show_results' => true,
            'allow_vote_change' => false,
            'metadata' => ['seeded' => true],
        ]);

        $options = collect(['Morning', 'Afternoon', 'Evening'])->map(function (string $label, int $index) use ($poll): PollOption {
            return PollOption::query()->updateOrCreate([
                'poll_id' => $poll->id,
                'text' => $label,
            ], [
                'sort_order' => $index,
            ]);
        });

        foreach ($students->take(6) as $index => $student) {
            PollVote::query()->updateOrCreate([
                'poll_id' => $poll->id,
                'student_id' => $student->id,
            ], [
                'poll_option_id' => $options[$index % $options->count()]->id,
            ]);
        }
    }

    /**
     * @param  Collection<int, Student>  $students
     */
    private function seedElections(Collection $students, ?AcademicPeriod $period, User $admin): void
    {
        if (! $period) {
            return;
        }

        $election = Election::query()->updateOrCreate([
            'slug' => 'src-general-election-demo',
        ], [
            'academic_period_id' => $period->id,
            'created_by_id' => $admin->id,
            'title' => 'SRC general election demo',
            'description' => 'Demo election for testing positions, candidates, voting, and public election pages.',
            'status' => ElectionStatus::Active,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDays(2),
            'results_visible' => true,
            'metadata' => ['seeded' => true],
        ]);

        $positions = collect(['SRC President', 'General Secretary'])->map(function (string $title, int $index) use ($election): ElectionPosition {
            return ElectionPosition::query()->updateOrCreate([
                'election_id' => $election->id,
                'title' => $title,
            ], [
                'description' => 'Demo position for local election testing.',
                'max_winners' => 1,
                'sort_order' => $index,
            ]);
        });

        foreach ($positions as $positionIndex => $position) {
            $candidateStudents = $students->slice($positionIndex * 2, 2)->values();

            foreach ($candidateStudents as $student) {
                ElectionCandidate::query()->updateOrCreate([
                    'election_position_id' => $position->id,
                    'student_id' => $student->id,
                ], [
                    'approved_by_id' => $admin->id,
                    'slogan' => 'Service, transparency, results.',
                    'manifesto' => 'Demo manifesto for candidate profile testing.',
                    'status' => CandidateStatus::Approved,
                    'approved_at' => now()->subDay(),
                    'metadata' => ['seeded' => true],
                ]);
            }

            $candidates = ElectionCandidate::query()
                ->whereBelongsTo($position, 'position')
                ->where('status', CandidateStatus::Approved)
                ->get();

            foreach ($students->slice(4, 5) as $voteIndex => $student) {
                ElectionVote::query()->updateOrCreate([
                    'election_position_id' => $position->id,
                    'student_id' => $student->id,
                ], [
                    'election_id' => $election->id,
                    'election_candidate_id' => $candidates[$voteIndex % $candidates->count()]->id,
                    'cast_at' => now()->subMinutes(30 - $voteIndex),
                    'metadata' => ['seeded' => true],
                ]);
            }
        }
    }

    /**
     * @param  Collection<int, Student>  $students
     * @param  Collection<int, Permit>  $permits
     */
    private function seedVerificationLogs(Collection $students, Collection $permits, User $staff): void
    {
        $results = [
            VerificationResult::Valid,
            VerificationResult::Invalid,
            VerificationResult::Expired,
            VerificationResult::Revoked,
            VerificationResult::NotFound,
        ];

        foreach ($students->take(8)->values() as $index => $student) {
            VerificationLog::query()->create([
                'method' => $index % 2 === 0 ? VerificationMethod::StudentNumber : VerificationMethod::PermitCode,
                'result' => $results[$index % count($results)],
                'identifier_hash' => hash('sha256', 'demo-verification-'.$student->student_number),
                'reason' => 'Demo verification attempt.',
                'student_id' => $student->id,
                'permit_id' => $permits->get($index)?->id,
                'verifier_id' => $staff->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'DevelopmentSeeder',
                'metadata' => ['seeded' => true],
            ]);
        }
    }

    /**
     * @param  Collection<int, Student>  $students
     * @param  Collection<int, Permit>  $permits
     */
    private function seedAuditLogs(User $admin, Collection $students, Collection $permits): void
    {
        $events = [
            [AuditEvents::StudentCreated, $students->first(), 'Created demo student profile.'],
            [AuditEvents::PermitIssued, $permits->first(), 'Issued demo permit.'],
            [AuditEvents::PaymentSuccessful, null, 'Confirmed demo payment.'],
            [AuditEvents::NfcRegistered, null, 'Registered demo NFC card.'],
            [AuditEvents::VerificationPerformed, null, 'Performed demo verification.'],
        ];

        foreach ($events as [$event, $auditable, $description]) {
            AuditLog::query()->firstOrCreate([
                'actor_id' => $admin->id,
                'event' => $event,
                'description' => $description,
            ], [
                'auditable_type' => $auditable ? $auditable::class : null,
                'auditable_id' => $auditable?->id,
                'metadata' => ['seeded' => true],
                'created_at' => now(),
            ]);
        }
    }
}
