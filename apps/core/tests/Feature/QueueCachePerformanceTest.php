<?php

use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Notifications\Auth\SetupPasswordNotification;
use App\Notifications\NfcCards\NfcCardRegisteredNotification;
use App\Notifications\Payments\PaymentSuccessfulNotification;
use App\Notifications\Permits\PermitIssuedNotification;
use App\Support\ActiveAcademicPeriod;
use App\Support\ApplicationCache;
use App\Support\DashboardSummary;
use Illuminate\Contracts\Queue\ShouldQueue;
use Laravel\Sanctum\PersonalAccessToken;

test('cached dashboard summary is invalidated when students change', function () {
    $summary = app(DashboardSummary::class);

    expect($summary->counts()['total_students'])->toBe(0);

    Student::factory()->create();

    expect($summary->counts()['total_students'])->toBe(1);
});

test('active academic period cache stores only scalar id', function () {
    $period = AcademicPeriod::factory()->active()->create();

    $activePeriod = app(ActiveAcademicPeriod::class)->get();

    expect($activePeriod?->id)->toBe($period->id)
        ->and(cache()->get(ApplicationCache::ActiveAcademicPeriod.':v1:id'))->toBe($period->id);
});

test('active academic period accepts a numeric string id returned by redis', function () {
    $period = AcademicPeriod::factory()->active()->create();

    cache()->put(ApplicationCache::ActiveAcademicPeriod.':v1:id', (string) $period->id, 300);

    expect(app(ActiveAcademicPeriod::class)->get()?->is($period))->toBeTrue();
});

test('current dated academic period takes precedence over a future active period', function () {
    AcademicPeriod::factory()->active()->create([
        'starts_at' => now()->addYear()->startOfMonth(),
        'ends_at' => now()->addYear()->endOfMonth(),
    ]);
    $currentPeriod = AcademicPeriod::factory()->create([
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->addMonth(),
    ]);

    expect(app(ActiveAcademicPeriod::class)->get()?->is($currentPeriod))->toBeTrue();
});

test('active academic period remains the fallback when no period contains today', function () {
    $futurePeriod = AcademicPeriod::factory()->active()->create([
        'starts_at' => now()->addYear()->startOfMonth(),
        'ends_at' => now()->addYear()->endOfMonth(),
    ]);

    expect(app(ActiveAcademicPeriod::class)->get()?->is($futurePeriod))->toBeTrue();
});

test('health endpoints respond with lightweight status data', function () {
    $this->get('/up')->assertOk();

    $this->getJson(route('health.database'))
        ->assertOk()
        ->assertJsonPath('status', 'ok')
        ->assertJsonPath('service', 'database');

    $this->getJson(route('health.queue'))
        ->assertOk()
        ->assertJsonPath('status', 'ok')
        ->assertJsonPath('service', 'queue');
});

test('operational email notifications are queued', function () {
    expect(new SetupPasswordNotification('token'))->toBeInstanceOf(ShouldQueue::class)
        ->and(new PermitIssuedNotification(Permit::factory()->make()))->toBeInstanceOf(ShouldQueue::class)
        ->and(new PaymentSuccessfulNotification(Payment::factory()->make()))->toBeInstanceOf(ShouldQueue::class)
        ->and(new NfcCardRegisteredNotification(NfcCard::factory()->make()))->toBeInstanceOf(ShouldQueue::class);
});

test('expired permits command marks active expired permits', function () {
    $permit = Permit::factory()->create([
        'status' => PermitStatus::Active,
        'starts_at' => now()->subMonths(2),
        'expires_at' => now()->subDay(),
    ]);

    $this->artisan('permits:expire')
        ->assertSuccessful();

    expect($permit->refresh()->status)->toBe(PermitStatus::Expired);
});

test('sanctum expired token pruning removes expired mobile tokens', function () {
    $user = User::factory()->create();
    $token = $user->createToken('expired-mobile')->accessToken;
    $token->forceFill(['expires_at' => now()->subDays(2)])->save();

    $this->artisan('sanctum:prune-expired --hours=24')
        ->assertSuccessful();

    expect(PersonalAccessToken::query()->whereKey($token->id)->exists())->toBeFalse();
});
