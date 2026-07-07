<?php

use App\Models\AcademicPeriod;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\Election;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Poll;
use App\Models\Student;
use App\Models\User;
use App\Support\MediaCollections;
use Database\Seeders\DevelopmentSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('development seeder creates a representative local dataset', function () {
    $this->seed(DevelopmentSeeder::class);

    expect(User::query()->where('email', 'nathaniel.ansah@kntsf.edu.gh')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'selina.adomako@kntsf.edu.gh')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'miriam.agyeman@kntsf.edu.gh')->exists())->toBeTrue()
        ->and(Student::query()->count())->toBeGreaterThanOrEqual(28)
        ->and(Student::query()->whereNotNull('user_id')->count())->toBeGreaterThanOrEqual(10)
        ->and(AcademicPeriod::query()->where('is_active', true)->count())->toBe(1)
        ->and(Permit::query()->count())->toBeGreaterThanOrEqual(22)
        ->and(Payment::query()->count())->toBeGreaterThanOrEqual(26)
        ->and(PermitRequest::query()->count())->toBeGreaterThanOrEqual(9)
        ->and(NfcCard::query()->count())->toBeGreaterThanOrEqual(20)
        ->and(ExecutiveProfile::query()->where('is_published', true)->count())->toBeGreaterThanOrEqual(4)
        ->and(Announcement::query()->where('slug', 'permit-card-distribution-window')->exists())->toBeTrue()
        ->and(Event::query()->where('slug', 'permit-renewal-clinic')->exists())->toBeTrue()
        ->and(Document::query()->where('slug', 'permit-renewal-guidelines-2026')->exists())->toBeTrue()
        ->and(Poll::query()->where('slug', 'preferred-src-office-hours')->exists())->toBeTrue()
        ->and(Election::query()->where('slug', 'src-general-election-2026')->exists())->toBeTrue()
        ->and(Document::query()->get()->every(fn (Document $document): bool => $document->hasMedia(MediaCollections::FILES)))->toBeTrue();
});

test('development seeder can be run repeatedly without duplicating fixed presentation records', function () {
    $this->seed(DevelopmentSeeder::class);
    $this->seed(DevelopmentSeeder::class);

    expect(User::query()->where('email', 'nathaniel.ansah@kntsf.edu.gh')->count())->toBe(1)
        ->and(Student::query()->where('student_number', '26100001')->count())->toBe(1)
        ->and(Announcement::query()->where('slug', 'permit-card-distribution-window')->count())->toBe(1)
        ->and(Poll::query()->where('slug', 'preferred-src-office-hours')->count())->toBe(1)
        ->and(Election::query()->where('slug', 'src-general-election-2026')->count())->toBe(1)
        ->and(Document::query()->where('slug', 'permit-renewal-guidelines-2026')->first()?->getMedia(MediaCollections::FILES)->count())->toBe(1);
});

test('development seeder avoids visible placeholder language in presentation records', function () {
    $this->seed(DevelopmentSeeder::class);

    $visibleValues = collect()
        ->merge(User::query()->pluck('name'))
        ->merge(User::query()->pluck('email'))
        ->merge(Student::query()->pluck('name'))
        ->merge(Student::query()->pluck('email'))
        ->merge(Announcement::query()->pluck('title'))
        ->merge(Announcement::query()->pluck('excerpt'))
        ->merge(Event::query()->pluck('title'))
        ->merge(Document::query()->pluck('title'))
        ->merge(Poll::query()->pluck('title'))
        ->merge(Election::query()->pluck('title'))
        ->filter()
        ->map(fn (string $value): string => mb_strtolower($value));

    expect($visibleValues->contains(fn (string $value): bool => str_contains($value, 'demo') || str_contains($value, 'test')))->toBeFalse();
});
