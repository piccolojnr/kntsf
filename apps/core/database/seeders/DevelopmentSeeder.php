<?php

namespace Database\Seeders;

use App\Enums\CandidateStatus;
use App\Enums\ElectionStatus;
use App\Enums\NfcCardStatus;
use App\Enums\PaymentStatus;
use App\Enums\PermitRequestReviewStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\PermitStatus;
use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Enums\StudentSource;
use App\Enums\StudentVerificationStatus;
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
use App\Models\PermitRequest;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Student;
use App\Models\User;
use App\Models\VerificationLog;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use App\Support\NfcUidHasher;
use App\Support\PermitCodeHasher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DevelopmentSeeder extends Seeder
{
    private const AssetDirectory = 'database/seeders/assets/presentation';

    private const Password = 'password';

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
            $payments = $this->seedPayments($students, $permits, $users['admin']);
            $this->seedPermitRequests($students, $periods->firstWhere('is_active', true), $payments, $users);
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
        return [
            'super_admin' => $this->user('Dr. Miriam Agyeman', 'miriam.agyeman@kntsf.edu.gh', 'super_admin'),
            'admin' => $this->user('Nathaniel K. Ansah', 'nathaniel.ansah@kntsf.edu.gh', 'admin'),
            'staff' => $this->user('Selina Adomako', 'selina.adomako@kntsf.edu.gh', 'staff'),
            'president' => $this->user('Evelyn Boakye', 'evelyn.boakye@kntsf.edu.gh', 'admin'),
            'secretary' => $this->user('Caleb Mensah', 'caleb.mensah@kntsf.edu.gh', 'admin'),
            'treasurer' => $this->user('Abigail Tetteh', 'abigail.tetteh@kntsf.edu.gh', 'admin'),
        ];
    }

    private function user(string $name, string $email, string $role): User
    {
        $user = User::query()->updateOrCreate([
            'email' => $email,
        ], [
            'name' => $name,
            'password' => self::Password,
            'email_verified_at' => now()->subMonths(3),
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
        $periods = [
            ['First Semester 2025/2026', 'First Semester', now()->subMonths(5), now()->subMonths(1), false],
            ['Second Semester 2025/2026', 'Second Semester', now()->subMonth(), now()->addMonths(3), true],
            ['First Semester 2026/2027', 'First Semester', now()->addMonths(4), now()->addMonths(8), false],
        ];

        foreach ($periods as [$name, $semester, $startsAt, $endsAt, $active]) {
            AcademicPeriod::query()->updateOrCreate([
                'name' => $name,
                'academic_year' => str_contains($name, '2026/2027') ? '2026/2027' : '2025/2026',
            ], [
                'semester' => $semester,
                'starts_at' => $startsAt->startOfMonth()->toDateString(),
                'ends_at' => $endsAt->endOfMonth()->toDateString(),
                'is_active' => $active,
                'metadata' => ['source' => 'presentation'],
            ]);
        }

        return AcademicPeriod::query()
            ->whereIn('academic_year', ['2025/2026', '2026/2027'])
            ->orderByDesc('is_active')
            ->orderBy('starts_at')
            ->get();
    }

    /**
     * @param  array<string, User>  $users
     * @return Collection<int, Student>
     */
    private function seedStudents(array $users): Collection
    {
        $rows = [
            ['26100001', 'Ama Serwaa Mensah', 'ama.mensah@students.kntsf.edu.gh', 'Computer Science', '400', true, StudentVerificationStatus::Verified],
            ['26100002', 'Kojo Asare Boateng', 'kojo.boateng@students.kntsf.edu.gh', 'Information Technology', '300', true, StudentVerificationStatus::Verified],
            ['26100003', 'Efua Nkrumah', 'efua.nkrumah@students.kntsf.edu.gh', 'Business Administration', '200', true, StudentVerificationStatus::Verified],
            ['26100004', 'Yaw Osei', 'yaw.osei@students.kntsf.edu.gh', 'Public Administration', '100', true, StudentVerificationStatus::Verified],
            ['26100005', 'Akua Frimpong', 'akua.frimpong@students.kntsf.edu.gh', 'Accounting', '300', true, StudentVerificationStatus::Verified],
            ['26100006', 'Kwame Owusu', 'kwame.owusu@students.kntsf.edu.gh', 'Marketing', '200', true, StudentVerificationStatus::Verified],
            ['26100007', 'Abena Darko', 'abena.darko@students.kntsf.edu.gh', 'Mass Communication', '400', true, StudentVerificationStatus::Verified],
            ['26100008', 'Kofi Addo', 'kofi.addo@students.kntsf.edu.gh', 'Economics', '100', true, StudentVerificationStatus::Verified],
            ['26100009', 'Esi Badu', 'esi.badu@students.kntsf.edu.gh', 'Computer Science', '200', true, StudentVerificationStatus::Verified],
            ['26100010', 'Nana Prempeh', 'nana.prempeh@students.kntsf.edu.gh', 'Information Technology', '300', true, StudentVerificationStatus::Verified],
            ['26100011', 'Afia Adjei', 'afia.adjei@students.kntsf.edu.gh', 'Business Administration', '400', false, StudentVerificationStatus::Verified],
            ['26100012', 'Kweku Sarpong', 'kweku.sarpong@students.kntsf.edu.gh', 'Public Administration', '100', false, StudentVerificationStatus::PendingReview],
            ['26100013', 'Mawuli Dzifa', 'mawuli.dzifa@students.kntsf.edu.gh', 'Procurement and Supply Chain', '300', false, StudentVerificationStatus::Verified],
            ['26100014', 'Priscilla Aidoo', 'priscilla.aidoo@students.kntsf.edu.gh', 'Hospitality Management', '200', false, StudentVerificationStatus::Verified],
            ['26100015', 'Daniel Kwesi Appiah', 'daniel.appiah@students.kntsf.edu.gh', 'Electrical Engineering', '400', false, StudentVerificationStatus::Verified],
            ['26100016', 'Nadia Owuraku', 'nadia.owuraku@students.kntsf.edu.gh', 'Nursing', '300', false, StudentVerificationStatus::PendingReview],
            ['26100017', 'Samuel Fiifi Quayson', 'samuel.quayson@students.kntsf.edu.gh', 'Mechanical Engineering', '200', false, StudentVerificationStatus::Verified],
            ['26100018', 'Linda Akosua Martey', 'linda.martey@students.kntsf.edu.gh', 'Banking and Finance', '400', false, StudentVerificationStatus::Verified],
            ['26100019', 'Elorm Sena Gakpo', 'elorm.gakpo@students.kntsf.edu.gh', 'Computer Science', '100', false, StudentVerificationStatus::Verified],
            ['26100020', 'Josephine Nyarko', 'josephine.nyarko@students.kntsf.edu.gh', 'Information Technology', '200', false, StudentVerificationStatus::PendingReview],
            ['26100021', 'Bright Kwaku Adu', 'bright.adu@students.kntsf.edu.gh', 'Accounting', '300', false, StudentVerificationStatus::Verified],
            ['26100022', 'Portia Amankwah', 'portia.amankwah@students.kntsf.edu.gh', 'Marketing', '400', false, StudentVerificationStatus::Verified],
            ['26100023', 'Michael Essien Jr', 'michael.essien@students.kntsf.edu.gh', 'Economics', '200', false, StudentVerificationStatus::Verified],
            ['26100024', 'Adwoa Sika Baah', 'adwoa.baah@students.kntsf.edu.gh', 'Public Administration', '300', false, StudentVerificationStatus::Rejected],
            ['26100025', 'Julius Annan', 'julius.annan@students.kntsf.edu.gh', 'Business Administration', '100', false, StudentVerificationStatus::Verified],
            ['26100026', 'Bernice Ofori', 'bernice.ofori@students.kntsf.edu.gh', 'Mass Communication', '300', false, StudentVerificationStatus::Verified],
            ['26100027', 'Isaac Tandoh', 'isaac.tandoh@students.kntsf.edu.gh', 'Procurement and Supply Chain', '400', false, StudentVerificationStatus::Verified],
            ['26100028', 'Theresa Naa Korkor', 'theresa.korkor@students.kntsf.edu.gh', 'Hospitality Management', '200', false, StudentVerificationStatus::Verified],
        ];

        return collect($rows)->map(function (array $row, int $index) use ($users): Student {
            [$number, $name, $email, $course, $level, $activated, $verificationStatus] = $row;

            $studentUser = null;

            if ($activated) {
                $studentUser = User::query()->updateOrCreate([
                    'email' => $email,
                ], [
                    'name' => $name,
                    'password' => self::Password,
                    'email_verified_at' => now()->subMonths(2),
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
                'phone' => '+233 '.(20 + ($index % 8)).' '.str_pad((string) (4100000 + ($index * 1739)), 7, '0', STR_PAD_LEFT),
                'course' => $course,
                'level' => $level,
                'source' => $index >= 12 ? StudentSource::SelfService : StudentSource::AdminImport,
                'verification_status' => $verificationStatus,
                'verified_at' => $verificationStatus === StudentVerificationStatus::Verified ? now()->subDays(30 - min($index, 20)) : null,
                'verified_by_id' => $verificationStatus === StudentVerificationStatus::Verified ? $users['staff']->id : null,
                'review_notes' => $verificationStatus === StudentVerificationStatus::Rejected ? 'Student number could not be matched with current registry records.' : null,
                'created_by_id' => $users['admin']->id,
                'updated_by_id' => $users['admin']->id,
                'metadata' => ['source' => 'presentation'],
            ]);
        })->values();
    }

    /**
     * @param  array<string, User>  $users
     */
    private function seedExecutiveProfiles(array $users): void
    {
        $profiles = [
            ['president', 'SRC President', 'Coordinates council priorities, student welfare advocacy, and inter-office accountability.', 'Evelyn has led residence engagement campaigns, fee dialogue sessions, and peer support initiatives across the student body.', 1, ['linkedin' => 'https://linkedin.com/in/evelyn-boakye']],
            ['secretary', 'General Secretary', 'Keeps council records, publishes communiques, and supervises administrative correspondence.', 'Caleb is focused on timely information flow, transparent minutes, and stronger class representative coordination.', 2, ['linkedin' => 'https://linkedin.com/in/caleb-mensah']],
            ['treasurer', 'Financial Secretary', 'Tracks budgets, payment records, and council financial reporting.', 'Abigail supports accountable spending and clear financial updates for committees and students.', 3, ['linkedin' => 'https://linkedin.com/in/abigail-tetteh']],
            ['staff', 'Verification Officer', 'Manages permit checks, NFC card registration, and student record verification.', 'Selina supports front-desk verification operations and daily permit reconciliation.', 4, []],
        ];

        foreach ($profiles as [$key, $position, $description, $biography, $sortOrder, $links]) {
            $profile = ExecutiveProfile::query()->updateOrCreate([
                'user_id' => $users[$key]->id,
            ], [
                'position' => $position,
                'position_description' => $description,
                'biography' => $biography,
                'category' => 'SRC Executive',
                'sort_order' => $sortOrder,
                'is_published' => true,
                'social_links' => $links,
            ]);

            $this->attachSeedImage($profile, MediaCollections::AVATAR, "executives/{$key}.jpg");
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

        return $students->take(22)->values()->map(function (Student $student, int $index) use ($activePeriod, $admin, $hasher): Permit {
            $code = 'KNT-'.now()->format('y').'-'.str_pad((string) ($index + 431), 4, '0', STR_PAD_LEFT).'-'.str_pad((string) (($index + 7) * 37), 4, '0', STR_PAD_LEFT);
            $status = match ($index) {
                15, 16 => PermitStatus::Expired,
                17, 18 => PermitStatus::Revoked,
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
                'starts_at' => now()->subDays(45 - min($index, 25)),
                'expires_at' => $status === PermitStatus::Expired ? now()->subDays(3 + $index) : now()->addDays(95 + $index),
                'amount_paid' => 50,
                'currency' => 'GHS',
                'card_delivered_at' => $index < 14 ? now()->subDays(20 - min($index, 18)) : null,
                'revoked_at' => $status === PermitStatus::Revoked ? now()->subDays(4) : null,
                'revoked_by_id' => $status === PermitStatus::Revoked ? $admin->id : null,
                'revocation_reason' => $status === PermitStatus::Revoked ? 'Card reported as transferred to another student.' : null,
                'metadata' => ['source' => 'presentation', 'reference_hint' => $code],
            ]);
        });
    }

    /**
     * @param  Collection<int, Student>  $students
     * @param  Collection<int, Permit>  $permits
     * @return Collection<string, Payment>
     */
    private function seedPayments(Collection $students, Collection $permits, User $admin): Collection
    {
        $payments = collect();

        foreach ($permits as $index => $permit) {
            $payment = Payment::query()->updateOrCreate([
                'reference' => 'KNT-PAY-'.now()->format('ym').'-'.str_pad((string) ($index + 1001), 5, '0', STR_PAD_LEFT),
            ], [
                'student_id' => $permit->student_id,
                'permit_id' => $permit->id,
                'gateway' => $index % 3 === 0 ? 'paystack' : 'manual',
                'gateway_reference' => $index % 3 === 0 ? 'ps_'.now()->format('ymd').'_'.str_pad((string) ($index + 501), 6, '0', STR_PAD_LEFT) : null,
                'status' => PaymentStatus::Success,
                'amount' => 50,
                'currency' => 'GHS',
                'paid_at' => now()->subDays(28 - min($index, 24)),
                'verified_at' => now()->subDays(27 - min($index, 23)),
                'created_by_id' => $admin->id,
                'metadata' => ['source' => 'presentation'],
            ]);

            $payments->put((string) $permit->student_id, $payment);
        }

        foreach ($students->slice(22, 4)->values() as $index => $student) {
            $status = match ($index) {
                1 => PaymentStatus::Failed,
                2 => PaymentStatus::Cancelled,
                default => PaymentStatus::Pending,
            };

            $payment = Payment::query()->updateOrCreate([
                'reference' => 'KNT-PAY-'.now()->format('ym').'-'.str_pad((string) ($index + 2101), 5, '0', STR_PAD_LEFT),
            ], [
                'student_id' => $student->id,
                'gateway' => 'paystack',
                'gateway_reference' => 'ps_'.now()->format('ymd').'_'.str_pad((string) ($index + 801), 6, '0', STR_PAD_LEFT),
                'status' => $status,
                'amount' => 50,
                'currency' => 'GHS',
                'failure_reason' => $status === PaymentStatus::Failed ? 'Issuer declined the transaction during authorization.' : null,
                'created_by_id' => $admin->id,
                'metadata' => ['source' => 'presentation'],
            ]);

            $payments->put((string) $student->id, $payment);
        }

        return $payments;
    }

    /**
     * @param  Collection<int, Student>  $students
     * @param  Collection<string, Payment>  $payments
     * @param  array<string, User>  $users
     */
    private function seedPermitRequests(Collection $students, ?AcademicPeriod $period, Collection $payments, array $users): void
    {
        if (! $period) {
            return;
        }

        foreach ($students->slice(18, 9)->values() as $index => $student) {
            $payment = $payments->get((string) $student->id);
            $status = match ($index) {
                0, 1, 2 => PermitRequestStatus::Issued,
                3 => PermitRequestStatus::Paid,
                4, 5 => PermitRequestStatus::AwaitingPayment,
                6 => PermitRequestStatus::Failed,
                7 => PermitRequestStatus::Cancelled,
                default => PermitRequestStatus::Pending,
            };
            $requiresReview = in_array($student->verification_status, [StudentVerificationStatus::PendingReview, StudentVerificationStatus::Rejected], true)
                || $status === PermitRequestStatus::Paid;

            PermitRequest::query()->updateOrCreate([
                'request_reference' => 'KNT-REQ-'.now()->format('ym').'-'.str_pad((string) ($index + 301), 4, '0', STR_PAD_LEFT),
            ], [
                'student_id' => $student->id,
                'academic_period_id' => $period->id,
                'payment_id' => $payment?->id,
                'requested_by_user_id' => $student->user_id,
                'source' => 'self_service',
                'status' => $status,
                'amount' => 50,
                'currency' => 'GHS',
                'contact_email' => $student->email,
                'contact_phone' => $student->phone,
                'requires_review' => $requiresReview,
                'review_status' => $requiresReview ? PermitRequestReviewStatus::PendingReview : PermitRequestReviewStatus::Approved,
                'reviewed_by_id' => $requiresReview ? null : $users['staff']->id,
                'reviewed_at' => $requiresReview ? null : now()->subDays(5),
                'expires_at' => $status === PermitRequestStatus::AwaitingPayment ? now()->addHours(18 - $index) : null,
                'metadata' => ['source' => 'presentation'],
            ]);
        }
    }

    /**
     * @param  Collection<int, Student>  $students
     */
    private function seedNfcCards(Collection $students, User $staff): void
    {
        $hasher = app(NfcUidHasher::class);

        foreach ($students->take(20)->values() as $index => $student) {
            $uid = '04:'.str_pad(dechex(70 + $index), 2, '0', STR_PAD_LEFT).':'.str_pad(dechex(120 + $index), 2, '0', STR_PAD_LEFT).':'.str_pad(dechex(30 + $index), 2, '0', STR_PAD_LEFT).':'.str_pad(dechex(200 - $index), 2, '0', STR_PAD_LEFT);
            $status = match ($index) {
                14 => NfcCardStatus::Lost,
                15 => NfcCardStatus::Revoked,
                16 => NfcCardStatus::Damaged,
                17 => NfcCardStatus::Replaced,
                default => NfcCardStatus::Active,
            };

            NfcCard::query()->updateOrCreate([
                'uid_hash' => $hasher->hash($uid),
            ], [
                'student_id' => $student->id,
                'uid_last4' => $hasher->lastFour($uid),
                'status' => $status,
                'issued_at' => now()->subWeeks(6)->addDays($index),
                'activated_at' => $status === NfcCardStatus::Active ? now()->subWeeks(6)->addDays($index) : null,
                'deactivated_at' => $status === NfcCardStatus::Active ? null : now()->subDays(4),
                'replaced_at' => $status === NfcCardStatus::Replaced ? now()->subDays(4) : null,
                'lost_at' => $status === NfcCardStatus::Lost ? now()->subDays(4) : null,
                'created_by_id' => $staff->id,
                'metadata' => ['source' => 'presentation'],
            ]);
        }
    }

    private function seedContent(User $author): void
    {
        $announcements = [
            ['permit-card-distribution-window', 'Permit card distribution window announced', 'Students with verified payments can collect printed permit cards from the SRC office between 9:00 AM and 4:00 PM on weekdays.', 'The SRC has opened a two-week distribution window for students whose permit payments and student records have been verified. Students should bring a valid student ID and confirm their phone number at the desk.', 'Permits', true, 5],
            ['library-access-validation-update', 'Library access validation update', 'Permit verification checks will be used at selected library entrances during evening study hours.', 'The evening study access desk will begin confirming active permit status from Monday. Students are encouraged to resolve pending payments before arriving at the entrance desk.', 'Campus', false, 8],
            ['student-transport-safety-briefing', 'Student transport safety briefing', 'A safety briefing for shuttle users and volunteer marshals will be held at the main auditorium.', 'The briefing will cover route discipline, incident reporting, and how permit records support quick identity verification during high-traffic periods.', 'Welfare', false, 12],
            ['src-front-desk-service-hours', 'SRC front desk service hours revised', 'The SRC front desk will operate extended service hours during the permit renewal period.', 'Front desk officers will support account activation, payment confirmation, NFC card replacement, and general student record enquiries during the renewal period.', 'SRC', false, 15],
        ];

        foreach ($announcements as [$slug, $title, $excerpt, $content, $category, $featured, $daysAgo]) {
            $announcement = Announcement::query()->updateOrCreate([
                'slug' => $slug,
            ], [
                'author_id' => $author->id,
                'title' => $title,
                'excerpt' => $excerpt,
                'content' => $content,
                'category' => $category,
                'status' => PublishStatus::Published,
                'visibility' => Visibility::Public,
                'is_featured' => $featured,
                'published_at' => now()->subDays($daysAgo),
                'metadata' => ['source' => 'presentation'],
            ]);

            $this->attachSeedImage($announcement, MediaCollections::FEATURED_IMAGE, "announcements/{$slug}.jpg");
        }

        $events = [
            ['permit-renewal-clinic', 'Permit renewal clinic', 'SRC Office Forecourt', 'Permits', 'A practical support clinic for students renewing permits, resolving pending payments, and activating accounts.', true, now()->addDays(6), 180, 64],
            ['student-leadership-forum', 'Student leadership forum', 'Main Auditorium', 'Governance', 'A forum for class representatives, society leaders, and SRC executives to align student welfare priorities.', true, now()->addDays(12), 350, 211],
            ['campus-safety-walkthrough', 'Campus safety walkthrough', 'Security Post', 'Welfare', 'A joint walkthrough with hall leaders, security officers, and transport marshals.', false, now()->addDays(18), 80, 28],
            ['finance-accountability-session', 'Finance accountability session', 'Conference Room B', 'Finance', 'A public briefing on dues, permit revenue reconciliation, and semester expenditure priorities.', false, now()->addDays(25), 120, 47],
        ];

        foreach ($events as [$slug, $title, $location, $category, $description, $featured, $startsAt, $maxAttendees, $currentAttendees]) {
            $event = Event::query()->updateOrCreate([
                'slug' => $slug,
            ], [
                'organizer_id' => $author->id,
                'title' => $title,
                'description' => $description,
                'excerpt' => $description,
                'location' => $location,
                'category' => $category,
                'status' => PublishStatus::Published,
                'visibility' => Visibility::Public,
                'is_featured' => $featured,
                'starts_at' => $startsAt,
                'ends_at' => $startsAt->copy()->addHours(2),
                'max_attendees' => $maxAttendees,
                'current_attendees' => $currentAttendees,
                'published_at' => now()->subDays(4),
                'metadata' => ['source' => 'presentation'],
            ]);

            $this->attachSeedImage($event, MediaCollections::BANNER, "events/{$slug}.jpg");
        }

        $documents = [
            ['permit-renewal-guidelines-2026', 'Permit Renewal Guidelines 2026', 'Step-by-step guidance for student permit renewal, payment confirmation, and collection.', 'Permits', true],
            ['src-financial-statement-q2', 'SRC Financial Statement Q2', 'Summary of receipts, expenditure lines, and balances for the second quarter.', 'Finance', true],
            ['student-representative-council-minutes-june', 'Student Representative Council Minutes - June', 'Approved minutes from the June council meeting.', 'Minutes', false],
            ['campus-safety-protocol-for-events', 'Campus Safety Protocol for Events', 'Operational checklist for SRC events, ushers, marshals, and venue leads.', 'Governance', false],
            ['election-code-of-conduct', 'Election Code of Conduct', 'Candidate and campaign rules for the student election cycle.', 'Elections', false],
        ];

        foreach ($documents as [$slug, $title, $description, $category, $featured]) {
            $document = Document::query()->updateOrCreate([
                'slug' => $slug,
            ], [
                'author_id' => $author->id,
                'title' => $title,
                'excerpt' => $description,
                'description' => $description."\n\nThis file is maintained by the SRC secretariat for student access and administrative reference.",
                'category' => $category,
                'status' => PublishStatus::Published,
                'visibility' => Visibility::Public,
                'is_featured' => $featured,
                'published_at' => now()->subDays(10),
                'metadata' => ['source' => 'presentation'],
            ]);

            $this->attachSeedImage($document, MediaCollections::FEATURED_IMAGE, "documents/{$slug}.jpg");
            $this->attachGeneratedDocument($document, $slug, $title, $description);
        }
    }

    /**
     * @param  Collection<int, Student>  $students
     */
    private function seedPolls(Collection $students, User $admin): void
    {
        $polls = [
            ['preferred-src-office-hours', 'Preferred SRC office hours', 'Which office hour window works best for permit and account support?', ['8:00 AM - 11:00 AM', '11:00 AM - 2:00 PM', '2:00 PM - 5:00 PM', 'After 5:00 PM']],
            ['priority-student-welfare-channel', 'Priority student welfare channel', 'Which communication channel should the SRC prioritize for urgent student welfare updates?', ['SMS alerts', 'Email bulletin', 'WhatsApp broadcast', 'Notice board']],
            ['permit-card-collection-location', 'Permit card collection location', 'Where should permit card collection desks be located during renewal week?', ['SRC office', 'Main auditorium lobby', 'Library entrance', 'Department offices']],
        ];

        foreach ($polls as $pollIndex => [$slug, $title, $description, $optionLabels]) {
            $poll = Poll::query()->updateOrCreate([
                'slug' => $slug,
            ], [
                'created_by_id' => $admin->id,
                'title' => $title,
                'description' => $description,
                'type' => PollType::FixedOptions,
                'status' => PublishStatus::Published,
                'visibility' => Visibility::Internal,
                'starts_at' => now()->subDays(3 + $pollIndex),
                'ends_at' => now()->addDays(7 + $pollIndex),
                'show_results' => true,
                'allow_vote_change' => $pollIndex === 1,
                'metadata' => ['source' => 'presentation'],
            ]);

            $options = collect($optionLabels)->map(function (string $label, int $index) use ($poll): PollOption {
                return PollOption::query()->updateOrCreate([
                    'poll_id' => $poll->id,
                    'text' => $label,
                ], [
                    'sort_order' => $index,
                ]);
            });

            foreach ($students->slice($pollIndex * 3, 18)->values() as $voteIndex => $student) {
                PollVote::query()->updateOrCreate([
                    'poll_id' => $poll->id,
                    'student_id' => $student->id,
                ], [
                    'poll_option_id' => $options[($voteIndex + $pollIndex) % $options->count()]->id,
                ]);
            }
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
            'slug' => 'src-general-election-2026',
        ], [
            'academic_period_id' => $period->id,
            'created_by_id' => $admin->id,
            'title' => 'SRC General Election 2026',
            'description' => 'Council election for executive offices, focused on welfare delivery, accountability, and student services.',
            'status' => ElectionStatus::Active,
            'starts_at' => now()->subHours(2),
            'ends_at' => now()->addDays(3),
            'results_visible' => true,
            'metadata' => ['source' => 'presentation'],
        ]);

        $positions = [
            ['SRC President', 'Leads the student council and represents student interests to management.'],
            ['General Secretary', 'Maintains council records, notices, and official correspondence.'],
            ['Financial Secretary', 'Oversees dues reconciliation, budget reporting, and payment records.'],
            ['Womens Commissioner', 'Coordinates welfare advocacy and inclusion initiatives.'],
        ];

        $approvedCandidates = collect();

        foreach ($positions as $positionIndex => [$title, $description]) {
            $position = ElectionPosition::query()->updateOrCreate([
                'election_id' => $election->id,
                'title' => $title,
            ], [
                'description' => $description,
                'max_winners' => 1,
                'sort_order' => $positionIndex,
            ]);

            foreach ($students->slice($positionIndex * 3, 3)->values() as $candidateIndex => $student) {
                $candidate = ElectionCandidate::query()->updateOrCreate([
                    'election_position_id' => $position->id,
                    'student_id' => $student->id,
                ], [
                    'approved_by_id' => $admin->id,
                    'slogan' => [
                        'Service with accountability',
                        'Reliable welfare, responsive leadership',
                        'Clear records, stronger representation',
                    ][$candidateIndex],
                    'manifesto' => 'My priority is to improve student support response time, publish clearer council updates, and keep campus services accessible throughout the semester.',
                    'status' => CandidateStatus::Approved,
                    'approved_at' => now()->subDays(5),
                    'metadata' => ['source' => 'presentation'],
                ]);

                $this->attachSeedImage($candidate, MediaCollections::POSTER, "candidates/{$student->student_number}.jpg");
                $approvedCandidates->push($candidate);
            }

            $candidates = ElectionCandidate::query()
                ->whereBelongsTo($position, 'position')
                ->where('status', CandidateStatus::Approved)
                ->get();

            foreach ($students->slice(10, 16)->values() as $voteIndex => $student) {
                ElectionVote::query()->updateOrCreate([
                    'election_position_id' => $position->id,
                    'student_id' => $student->id,
                ], [
                    'election_id' => $election->id,
                    'election_candidate_id' => $candidates[($voteIndex + $positionIndex) % $candidates->count()]->id,
                    'cast_at' => now()->subMinutes(150 - ($voteIndex * 4)),
                    'metadata' => ['source' => 'presentation'],
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
            VerificationResult::Valid,
            VerificationResult::Valid,
            VerificationResult::Expired,
            VerificationResult::Revoked,
            VerificationResult::NotFound,
            VerificationResult::CardInactive,
            VerificationResult::Mismatch,
        ];

        foreach ($students->take(24)->values() as $index => $student) {
            VerificationLog::query()->firstOrCreate([
                'identifier_hash' => hash('sha256', 'presentation-verification-'.$student->student_number.'-'.$index),
            ], [
                'method' => match ($index % 3) {
                    0 => VerificationMethod::StudentNumber,
                    1 => VerificationMethod::PermitCode,
                    default => VerificationMethod::Nfc,
                },
                'result' => $results[$index % count($results)],
                'reason' => $index % 5 === 0 ? 'Manual desk check during card collection.' : null,
                'student_id' => $student->id,
                'permit_id' => $permits->get($index % max($permits->count(), 1))?->id,
                'verifier_id' => $staff->id,
                'ip_address' => '10.24.'.$index.'.'.(40 + $index),
                'user_agent' => 'KntsfPortal/1.0',
                'metadata' => ['source' => 'presentation'],
                'created_at' => now()->subHours(36 - $index),
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
            [AuditEvents::StudentCreated, $students->first(), 'Imported verified student records for the current semester.'],
            [AuditEvents::PermitIssued, $permits->first(), 'Issued permit after payment confirmation.'],
            [AuditEvents::PaymentSuccessful, null, 'Confirmed Paystack payment and linked it to a student permit.'],
            [AuditEvents::NfcRegistered, null, 'Registered NFC card for front desk verification.'],
            [AuditEvents::VerificationPerformed, null, 'Completed permit verification at the SRC service desk.'],
            [AuditEvents::PermitRevoked, $permits->firstWhere('status', PermitStatus::Revoked), 'Revoked permit after a transfer report was confirmed.'],
        ];

        foreach ($events as [$event, $auditable, $description]) {
            AuditLog::query()->firstOrCreate([
                'actor_id' => $admin->id,
                'event' => $event,
                'description' => $description,
            ], [
                'auditable_type' => $auditable ? $auditable::class : null,
                'auditable_id' => $auditable?->id,
                'metadata' => ['source' => 'presentation'],
                'created_at' => now()->subHours(6),
            ]);
        }
    }

    private function attachSeedImage(Model $model, string $collection, string $relativePath): void
    {
        $path = base_path(self::AssetDirectory.'/images/'.$relativePath);

        if (! File::exists($path) || $model->hasMedia($collection)) {
            return;
        }

        $model
            ->addMedia($path)
            ->preservingOriginal()
            ->toMediaCollection($collection);
    }

    private function attachGeneratedDocument(Document $document, string $slug, string $title, string $description): void
    {
        if ($document->hasMedia(MediaCollections::FILES)) {
            return;
        }

        $directory = 'seeded-documents';
        $fileName = $slug.'.txt';
        $path = $directory.'/'.$fileName;

        Storage::disk('local')->put($path, implode(PHP_EOL.PHP_EOL, [
            $title,
            $description,
            'Prepared by the SRC Secretariat.',
            'Reference date: '.now()->toFormattedDateString(),
            'For student access, administrative review, and public information.',
        ]));

        $document
            ->addMedia(Storage::disk('local')->path($path))
            ->preservingOriginal()
            ->usingName($title)
            ->usingFileName($fileName)
            ->toMediaCollection(MediaCollections::FILES);
    }
}
