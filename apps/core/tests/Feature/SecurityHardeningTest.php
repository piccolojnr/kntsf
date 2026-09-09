<?php

use App\Enums\AccountActivationPurpose;
use App\Models\AcademicPeriod;
use App\Models\AccountActivationToken;
use App\Models\Announcement;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Models\VerificationLog;
use App\Support\PermitCodeHasher;
use App\Support\VerificationIdentifierHasher;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function securityUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function securitySetupToken(User $user): string
{
    $plainToken = 'security-token-'.str()->random(20);

    AccountActivationToken::query()->create([
        'user_id' => $user->id,
        'token_hash' => hash('sha256', $plainToken),
        'purpose' => AccountActivationPurpose::SetupPassword,
        'expires_at' => now()->addHour(),
    ]);

    return $plainToken;
}

test('public users cannot access dashboard routes', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('setup password route is throttled and tokens cannot be reused', function () {
    $user = User::factory()->create(['password' => null]);
    $token = securitySetupToken($user);

    for ($attempt = 0; $attempt < 6; $attempt++) {
        $this->get(route('account.setup-password.show', $token))->assertOk();
    }

    $this->get(route('account.setup-password.show', $token))
        ->assertTooManyRequests();

    $this->travel(61)->seconds();

    $this->post(route('account.setup-password.store', $token), [
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertRedirect(route('login'));

    expect(Hash::check('Password123!', $user->fresh()->password))->toBeTrue();

    $this->post(route('account.setup-password.store', $token), [
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertSessionHasErrors('token');
});

test('verification attempts are throttled', function () {
    $user = securityUserWithRole('staff');

    for ($attempt = 0; $attempt < 30; $attempt++) {
        $this->actingAs($user)
            ->post(route('verification.student-number'), [
                'student_number' => 'missing-student',
            ])
            ->assertRedirect();
    }

    $this->actingAs($user)
        ->post(route('verification.student-number'), [
            'student_number' => 'missing-student',
        ])
        ->assertTooManyRequests();
});

test('public announcement serialization excludes internal metadata', function () {
    $announcement = Announcement::factory()
        ->published()
        ->create([
            'slug' => 'security-public-announcement',
            'metadata' => [
                'internal_notes' => 'Do not expose this',
            ],
        ]);

    $this->get(route('public.announcements.show', $announcement))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/announcements/show')
            ->where('announcement.slug', 'security-public-announcement')
            ->missing('announcement.metadata'));
});

test('raw permit code is not stored in verification logs', function () {
    $student = Student::factory()->create();
    $period = AcademicPeriod::factory()->active()->create();
    $plainCode = 'KNT-SECURE-1234';

    Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'code_hash' => app(PermitCodeHasher::class)->hash($plainCode),
        'code_last4' => '1234',
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDays(30),
    ]);

    $this->actingAs(securityUserWithRole('staff'))
        ->post(route('verification.permit-code'), [
            'permit_code' => $plainCode,
        ])
        ->assertRedirect();

    $log = VerificationLog::query()->firstOrFail();

    expect($log->identifier_hash)->toBe(app(VerificationIdentifierHasher::class)->hash($plainCode))
        ->and($log->identifier_hash)->not->toBe($plainCode)
        ->and(json_encode($log->metadata))->not->toContain($plainCode)
        ->and($log->reason)->not->toContain($plainCode);
});
