<?php

use App\Models\AcademicPeriod;
use App\Models\Announcement;
use App\Models\Election;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Poll;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DevelopmentSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('development seeder creates a representative local dataset', function () {
    $this->seed(DevelopmentSeeder::class);

    expect(User::query()->where('email', 'admin@kntsf.test')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'staff@kntsf.test')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'superadmin@kntsf.test')->exists())->toBeTrue()
        ->and(Student::query()->count())->toBeGreaterThanOrEqual(12)
        ->and(Student::query()->whereNotNull('user_id')->count())->toBeGreaterThanOrEqual(4)
        ->and(AcademicPeriod::query()->where('is_active', true)->count())->toBe(1)
        ->and(Permit::query()->count())->toBeGreaterThanOrEqual(8)
        ->and(Payment::query()->count())->toBeGreaterThanOrEqual(7)
        ->and(NfcCard::query()->count())->toBeGreaterThanOrEqual(7)
        ->and(Announcement::query()->where('slug', 'src-permit-verification-rollout')->exists())->toBeTrue()
        ->and(Poll::query()->where('slug', 'preferred-src-office-hours')->exists())->toBeTrue()
        ->and(Election::query()->where('slug', 'src-general-election-demo')->exists())->toBeTrue();
});

test('development seeder can be run repeatedly without duplicating fixed demo records', function () {
    $this->seed(DevelopmentSeeder::class);
    $this->seed(DevelopmentSeeder::class);

    expect(User::query()->where('email', 'admin@kntsf.test')->count())->toBe(1)
        ->and(Student::query()->where('student_number', '26100001')->count())->toBe(1)
        ->and(Announcement::query()->where('slug', 'src-permit-verification-rollout')->count())->toBe(1)
        ->and(Poll::query()->where('slug', 'preferred-src-office-hours')->count())->toBe(1)
        ->and(Election::query()->where('slug', 'src-general-election-demo')->count())->toBe(1);
});
