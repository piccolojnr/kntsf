<?php

use App\Enums\AccountActivationPurpose;
use App\Models\AccountActivationToken;
use App\Models\Student;
use App\Models\User;
use App\Notifications\Auth\SetupPasswordNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function activationUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function createSetupToken(User $user, array $overrides = []): array
{
    $plainToken = $overrides['plain_token'] ?? 'plain-token-'.str()->random(16);

    unset($overrides['plain_token']);

    $activationToken = AccountActivationToken::query()->create([
        'user_id' => $user->id,
        'token_hash' => hash('sha256', $plainToken),
        'purpose' => AccountActivationPurpose::SetupPassword,
        'expires_at' => now()->addDay(),
        'used_at' => null,
        ...$overrides,
    ]);

    return [$plainToken, $activationToken];
}

test('student without email cannot be activated', function () {
    Notification::fake();

    $student = Student::factory()->create(['email' => null]);

    $this->actingAs(activationUserWithRole('admin'))
        ->from(route('students.show', $student))
        ->post(route('students.activate-account', $student))
        ->assertRedirect(route('students.show', $student))
        ->assertSessionHasErrors('email');

    expect($student->fresh()->user_id)->toBeNull();
    Notification::assertNothingSent();
});

test('authorized user can activate student', function () {
    Notification::fake();

    $student = Student::factory()->create([
        'name' => 'Student User',
        'email' => 'student@example.com',
    ]);

    $this->actingAs(activationUserWithRole('admin'))
        ->post(route('students.activate-account', $student))
        ->assertRedirect();

    $student->refresh();

    expect($student->user_id)->not->toBeNull()
        ->and($student->user->email)->toBe('student@example.com')
        ->and($student->user->password)->toBeNull();

    Notification::assertSentTo($student->user, SetupPasswordNotification::class);
});

test('unauthorized user cannot activate student', function () {
    Notification::fake();

    $student = Student::factory()->create(['email' => 'student@example.com']);

    $this->actingAs(activationUserWithRole('student'))
        ->post(route('students.activate-account', $student))
        ->assertForbidden();

    expect($student->fresh()->user_id)->toBeNull();
    Notification::assertNothingSent();
});

test('activation creates user if missing', function () {
    $student = Student::factory()->create([
        'name' => 'New Student',
        'email' => 'new-student@example.com',
    ]);

    $this->actingAs(activationUserWithRole('admin'))
        ->post(route('students.activate-account', $student));

    $this->assertDatabaseHas('users', [
        'name' => 'New Student',
        'email' => 'new-student@example.com',
        'password' => null,
    ]);

    expect($student->fresh()->user)->not->toBeNull();
});

test('activation assigns student role', function () {
    $student = Student::factory()->create(['email' => 'role-student@example.com']);

    $this->actingAs(activationUserWithRole('admin'))
        ->post(route('students.activate-account', $student));

    expect($student->fresh()->user->hasRole('student'))->toBeTrue();
});

test('activation creates hashed token', function () {
    $student = Student::factory()->create(['email' => 'token-student@example.com']);

    $this->actingAs(activationUserWithRole('admin'))
        ->post(route('students.activate-account', $student));

    $activationToken = AccountActivationToken::query()->sole();

    expect($activationToken->user_id)->toBe($student->fresh()->user_id)
        ->and($activationToken->purpose)->toBe(AccountActivationPurpose::SetupPassword)
        ->and($activationToken->token_hash)->toHaveLength(64)
        ->and($activationToken->isValid())->toBeTrue();
});

test('old unused setup tokens are invalidated', function () {
    $user = User::factory()->create(['password' => null]);
    $student = Student::factory()->create([
        'email' => $user->email,
        'user_id' => $user->id,
    ]);
    [, $oldToken] = createSetupToken($user);

    $this->actingAs(activationUserWithRole('admin'))
        ->post(route('students.activate-account', $student));

    expect($oldToken->fresh()->used_at)->not->toBeNull()
        ->and(AccountActivationToken::query()->whereNull('used_at')->count())->toBe(1);
});

test('setup password page rejects invalid expired and used token', function () {
    $user = User::factory()->create(['password' => null]);

    $this->get(route('account.setup-password.show', 'invalid-token'))
        ->assertNotFound();

    [$expiredToken] = createSetupToken($user, ['expires_at' => now()->subMinute()]);
    $this->get(route('account.setup-password.show', $expiredToken))
        ->assertNotFound();

    [$usedToken] = createSetupToken($user, ['used_at' => now()]);
    $this->get(route('account.setup-password.show', $usedToken))
        ->assertNotFound();
});

test('student can set initial password with valid token', function () {
    $user = User::factory()->create(['password' => null]);
    $user->assignRole('student');
    [$plainToken, $activationToken] = createSetupToken($user);

    $this->post(route('account.setup-password.store', $plainToken), [
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])
        ->assertRedirect(route('account.mobile-app'));

    expect(Hash::check('Password123!', $user->fresh()->password))->toBeTrue()
        ->and($activationToken->fresh()->used_at)->not->toBeNull();
});

test('setup password link remains available to an already authenticated user', function () {
    $student = User::factory()->create(['password' => null]);
    $student->assignRole('student');
    [$plainToken] = createSetupToken($student);

    $this->actingAs(User::factory()->create())
        ->get(route('account.setup-password.show', $plainToken))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/setup-password'));
});

test('authenticated user can complete a valid setup link', function () {
    $student = User::factory()->create(['password' => null]);
    $student->assignRole('student');
    [$plainToken] = createSetupToken($student);

    $this->actingAs(User::factory()->create())
        ->post(route('account.setup-password.store', $plainToken), [
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertRedirect(route('account.mobile-app'));

    $this->assertGuest();
});

test('token cannot be reused', function () {
    $user = User::factory()->create(['password' => null]);
    [$plainToken] = createSetupToken($user);

    $payload = [
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ];

    $this->post(route('account.setup-password.store', $plainToken), $payload)
        ->assertRedirect(route('login'));

    $this->post(route('account.setup-password.store', $plainToken), $payload)
        ->assertSessionHasErrors('token');
});

test('activated student can login after setting password', function () {
    $user = User::factory()->create([
        'email' => 'login-student@example.com',
        'password' => null,
    ]);
    $user->assignRole('student');
    [$plainToken] = createSetupToken($user);

    $this->post(route('account.setup-password.store', $plainToken), [
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $this->post('/login', [
        'email' => 'login-student@example.com',
        'password' => 'Password123!',
    ])->assertRedirect(route('account.mobile-app', absolute: false));

    $this->assertAuthenticatedAs($user);
});
