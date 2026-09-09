<?php

use App\Enums\PermitStatus;
use App\Enums\VerificationResult;
use App\Models\AcademicPeriod;
use App\Models\NfcCard;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Support\NfcUidHasher;
use App\Support\PermitCodeHasher;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function mobileUserWithRole(string $role, array $attributes = []): User
{
    $user = User::factory()->create([
        'password' => Hash::make('Password123!'),
        ...$attributes,
    ]);
    $user->assignRole($role);

    return $user;
}

function bearerTokenFor(User $user): string
{
    return $user->createToken('test-mobile', ['mobile'])->plainTextToken;
}

function activeMobilePermitFor(Student $student): Permit
{
    $period = AcademicPeriod::factory()->active()->create();
    $code = 'MOBILE-PERMIT-'.fake()->unique()->numberBetween(1000, 9999);

    return Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'code_hash' => app(PermitCodeHasher::class)->hash($code),
        'code_last4' => mb_substr($code, -4),
        'status' => PermitStatus::Active,
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDays(30),
    ]);
}

test('mobile login succeeds', function () {
    $user = mobileUserWithRole('student', ['email' => 'mobile-student@example.com']);

    $this->postJson('/api/mobile/auth/login', [
        'email' => 'mobile-student@example.com',
        'password' => 'Password123!',
        'device_name' => 'Expo iPhone',
    ])
        ->assertOk()
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.roles.0', 'student')
        ->assertJsonStructure(['token']);
});

test('inactive user login is rejected', function () {
    mobileUserWithRole('student', [
        'email' => 'inactive-student@example.com',
        'is_active' => false,
    ]);

    $this->postJson('/api/mobile/auth/login', [
        'email' => 'inactive-student@example.com',
        'password' => 'Password123!',
    ])->assertUnprocessable();
});

test('student can only see own profile', function () {
    $user = mobileUserWithRole('student');
    $ownStudent = Student::factory()->create(['user_id' => $user->id]);
    $otherStudent = Student::factory()->create();

    $this->withToken(bearerTokenFor($user))
        ->getJson('/api/mobile/student/profile')
        ->assertOk()
        ->assertJsonPath('data.id', $ownStudent->id)
        ->assertJsonMissing(['student_number' => $otherStudent->student_number]);
});

test('student cannot access operations endpoints', function () {
    $user = mobileUserWithRole('student');
    Student::factory()->create(['user_id' => $user->id]);

    $this->withToken(bearerTokenFor($user))
        ->getJson('/api/mobile/operations/students/search?search=STU')
        ->assertForbidden();
});

test('staff can search students', function () {
    $student = Student::factory()->create([
        'student_number' => '26102859',
        'name' => 'Searchable Student',
    ]);

    $this->withToken(bearerTokenFor(mobileUserWithRole('staff')))
        ->getJson('/api/mobile/operations/students/search?search=2610')
        ->assertOk()
        ->assertJsonPath('data.0.id', $student->id)
        ->assertJsonPath('data.0.student_number', '26102859');
});

test('staff can verify NFC without returning raw UID', function () {
    $student = Student::factory()->create();
    activeMobilePermitFor($student);
    $uid = '04:A1:B2:C3:99';

    NfcCard::factory()->create([
        'student_id' => $student->id,
        'uid_hash' => app(NfcUidHasher::class)->hash($uid),
        'uid_last4' => app(NfcUidHasher::class)->lastFour($uid),
    ]);

    $response = $this->withToken(bearerTokenFor(mobileUserWithRole('staff')))
        ->postJson('/api/mobile/verification/nfc', [
            'uid' => $uid,
        ])
        ->assertOk()
        ->assertJsonPath('data.result', VerificationResult::Valid->value)
        ->assertJsonMissing(['uid' => $uid])
        ->assertJsonMissing(['uid_hash' => app(NfcUidHasher::class)->hash($uid)]);

    expect($response->getContent())->not->toContain($uid)
        ->not->toContain(app(NfcUidHasher::class)->hash($uid));
});

test('token logout revokes access', function () {
    $user = mobileUserWithRole('student');
    Student::factory()->create(['user_id' => $user->id]);
    $token = bearerTokenFor($user);

    $this->withToken($token)
        ->postJson('/api/mobile/auth/logout')
        ->assertOk();

    expect(PersonalAccessToken::query()->count())->toBe(0);

    $this->app['auth']->forgetGuards();

    $this->withToken($token)
        ->getJson('/api/mobile/student/profile')
        ->assertUnauthorized();
});
