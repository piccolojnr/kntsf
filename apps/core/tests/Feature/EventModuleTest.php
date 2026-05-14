<?php

use App\Actions\Events\PublishEventAction;
use App\Enums\PublishStatus;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\User;
use App\Support\AuditEvents;
use Database\Seeders\RolesAndPermissionsSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function eventUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('authorized user can create event', function () {
    $user = eventUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('events.store'), [
            'title' => 'SRC Leadership Forum',
            'description' => 'A leadership forum for students.',
            'starts_at' => now()->addWeek()->toDateTimeString(),
            'status' => 'draft',
            'visibility' => 'public',
        ])
        ->assertRedirect();

    $event = Event::query()->firstOrFail();

    expect($event->organizer_id)->toBe($user->id)
        ->and($event->title)->toBe('SRC Leadership Forum')
        ->and($event->slug)->toBe('src-leadership-forum')
        ->and($event->status)->toBe(PublishStatus::Draft);
});

test('unauthorized user cannot create event', function () {
    $this->actingAs(eventUserWithRole('student'))
        ->post(route('events.store'), [
            'title' => 'SRC Leadership Forum',
            'description' => 'A leadership forum for students.',
            'starts_at' => now()->addWeek()->toDateTimeString(),
        ])
        ->assertForbidden();
});

test('event slug is generated uniquely', function () {
    Event::factory()->create([
        'slug' => 'src-leadership-forum',
    ]);

    $this->actingAs(eventUserWithRole('admin'))
        ->post(route('events.store'), [
            'title' => 'SRC Leadership Forum',
            'description' => 'A leadership forum for students.',
            'starts_at' => now()->addWeek()->toDateTimeString(),
        ])
        ->assertRedirect();

    expect(Event::query()->where('slug', 'src-leadership-forum-2')->exists())->toBeTrue();
});

test('event can be published and archived', function () {
    $event = Event::factory()->create([
        'status' => PublishStatus::Draft,
        'published_at' => null,
    ]);

    $this->actingAs(eventUserWithRole('admin'))
        ->post(route('events.publish', $event))
        ->assertRedirect();

    expect($event->refresh()->status)->toBe(PublishStatus::Published)
        ->and($event->published_at)->not->toBeNull();

    $this->actingAs(eventUserWithRole('admin'))
        ->post(route('events.archive', $event))
        ->assertRedirect();

    expect($event->refresh()->status)->toBe(PublishStatus::Archived)
        ->and($event->archived_at)->not->toBeNull();
});

test('starts at is required', function () {
    $this->actingAs(eventUserWithRole('admin'))
        ->from(route('events.create'))
        ->post(route('events.store'), [
            'title' => 'SRC Leadership Forum',
            'description' => 'A leadership forum for students.',
        ])
        ->assertRedirect(route('events.create'))
        ->assertSessionHasErrors('starts_at');
});

test('ends at must be after starts at', function () {
    $startsAt = now()->addWeek();

    $this->actingAs(eventUserWithRole('admin'))
        ->from(route('events.create'))
        ->post(route('events.store'), [
            'title' => 'SRC Leadership Forum',
            'description' => 'A leadership forum for students.',
            'starts_at' => $startsAt->toDateTimeString(),
            'ends_at' => $startsAt->copy()->subHour()->toDateTimeString(),
        ])
        ->assertRedirect(route('events.create'))
        ->assertSessionHasErrors('ends_at');
});

test('audit logs are created for event lifecycle', function () {
    $user = eventUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('events.store'), [
            'title' => 'SRC Leadership Forum',
            'description' => 'A leadership forum for students.',
            'starts_at' => now()->addWeek()->toDateTimeString(),
        ])
        ->assertRedirect();

    $event = Event::query()->firstOrFail();

    app(PublishEventAction::class)->handle($event, $user);

    expect(AuditLog::query()->where('event', AuditEvents::EventCreated)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('event', AuditEvents::EventPublished)->exists())->toBeTrue();
});
