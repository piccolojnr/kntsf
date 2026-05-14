<?php

use App\Actions\Polls\MergePollOptionAction;
use App\Enums\PollOptionStatus;
use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Models\AuditLog;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Student;
use App\Models\User;
use App\Support\AuditEvents;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function pollUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function pollStudentUser(): User
{
    $user = pollUserWithRole('student');
    Student::factory()->create([
        'user_id' => $user->id,
    ]);

    return $user;
}

test('authorized user can create fixed poll', function () {
    $user = pollUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('polls.store'), [
            'title' => 'Preferred SRC meeting day',
            'type' => 'fixed_options',
            'visibility' => 'internal',
            'options' => [
                ['text' => 'Monday'],
                ['text' => 'Friday'],
            ],
        ])
        ->assertRedirect();

    $poll = Poll::query()->firstOrFail();

    expect($poll->created_by_id)->toBe($user->id)
        ->and($poll->title)->toBe('Preferred SRC meeting day')
        ->and($poll->slug)->toBe('preferred-src-meeting-day')
        ->and($poll->type)->toBe(PollType::FixedOptions)
        ->and($poll->options)->toHaveCount(2);
});

test('fixed poll requires at least two options to publish', function () {
    $poll = Poll::factory()->create([
        'type' => PollType::FixedOptions,
        'status' => PublishStatus::Draft,
    ]);
    PollOption::factory()->create([
        'poll_id' => $poll->id,
    ]);

    $this->actingAs(pollUserWithRole('admin'))
        ->post(route('polls.publish', $poll))
        ->assertSessionHasErrors('options');

    expect($poll->refresh()->status)->toBe(PublishStatus::Draft);
});

test('student can vote once', function () {
    $poll = Poll::factory()->published()->create();
    $option = PollOption::factory()->create([
        'poll_id' => $poll->id,
    ]);

    $this->actingAs(pollStudentUser())
        ->post(route('polls.vote', $poll), [
            'poll_option_id' => $option->id,
        ])
        ->assertRedirect();

    expect(PollVote::query()->where('poll_id', $poll->id)->count())->toBe(1);
});

test('duplicate vote is blocked unless vote change is allowed', function () {
    $poll = Poll::factory()->published()->create([
        'allow_vote_change' => false,
    ]);
    $first = PollOption::factory()->create(['poll_id' => $poll->id]);
    $second = PollOption::factory()->create(['poll_id' => $poll->id]);
    $studentUser = pollStudentUser();

    $this->actingAs($studentUser)
        ->post(route('polls.vote', $poll), ['poll_option_id' => $first->id])
        ->assertRedirect();

    $this->actingAs($studentUser)
        ->post(route('polls.vote', $poll), ['poll_option_id' => $second->id])
        ->assertSessionHasErrors('poll_option_id');

    $poll->update(['allow_vote_change' => true]);

    $this->actingAs($studentUser)
        ->post(route('polls.vote', $poll), ['poll_option_id' => $second->id])
        ->assertRedirect();

    expect(PollVote::query()->where('poll_id', $poll->id)->count())->toBe(1)
        ->and(PollVote::query()->firstOrFail()->poll_option_id)->toBe($second->id);
});

test('archived poll cannot receive votes', function () {
    $poll = Poll::factory()->archived()->create();
    $option = PollOption::factory()->create([
        'poll_id' => $poll->id,
    ]);

    $this->actingAs(pollStudentUser())
        ->post(route('polls.vote', $poll), [
            'poll_option_id' => $option->id,
        ])
        ->assertSessionHasErrors('poll');

    expect(PollVote::query()->count())->toBe(0);
});

test('results respect show results', function () {
    $poll = Poll::factory()->published()->create([
        'show_results' => false,
    ]);
    $option = PollOption::factory()->create(['poll_id' => $poll->id]);
    PollVote::factory()->create([
        'poll_id' => $poll->id,
        'poll_option_id' => $option->id,
    ]);

    $this->actingAs(pollStudentUser())
        ->get(route('polls.show', $poll))
        ->assertInertia(fn (Assert $page) => $page
            ->component('polls/show')
            ->where('can.view_results', false)
            ->where('poll.options.0.votes_count', null));
});

test('option with votes cannot be deleted', function () {
    $poll = Poll::factory()->published()->create();
    $option = PollOption::factory()->create(['poll_id' => $poll->id]);
    PollVote::factory()->create([
        'poll_id' => $poll->id,
        'poll_option_id' => $option->id,
    ]);

    expect($option->delete())->toBeFalse()
        ->and(PollOption::query()->whereKey($option->id)->exists())->toBeTrue();
});

test('merge option moves votes', function () {
    $poll = Poll::factory()->published()->create();
    $source = PollOption::factory()->create(['poll_id' => $poll->id]);
    $target = PollOption::factory()->create(['poll_id' => $poll->id]);
    $vote = PollVote::factory()->create([
        'poll_id' => $poll->id,
        'poll_option_id' => $source->id,
    ]);
    $actor = pollUserWithRole('admin');

    app(MergePollOptionAction::class)->handle($poll, $source, $target, $actor);

    expect($vote->refresh()->poll_option_id)->toBe($target->id)
        ->and($source->refresh()->status)->toBe(PollOptionStatus::Merged)
        ->and($source->merged_into_id)->toBe($target->id);
});

test('audit logs are created', function () {
    $admin = pollUserWithRole('admin');

    $this->actingAs($admin)
        ->post(route('polls.store'), [
            'title' => 'Preferred SRC meeting day',
            'options' => [
                ['text' => 'Monday'],
                ['text' => 'Friday'],
            ],
        ])
        ->assertRedirect();

    $poll = Poll::query()->firstOrFail();
    $option = $poll->options()->firstOrFail();

    $this->actingAs($admin)
        ->post(route('polls.publish', $poll))
        ->assertRedirect();

    $this->actingAs(pollStudentUser())
        ->post(route('polls.vote', $poll), [
            'poll_option_id' => $option->id,
        ])
        ->assertRedirect();

    expect(AuditLog::query()->where('event', AuditEvents::PollCreated)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('event', AuditEvents::PollPublished)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('event', AuditEvents::PollVoteCast)->exists())->toBeTrue();
});
