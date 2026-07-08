<?php

use App\Actions\Elections\CastElectionVoteAction;
use App\Enums\CandidateStatus;
use App\Enums\ElectionStatus;
use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\AuditLog;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\ElectionVote;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Support\AuditEvents;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function electionUserWithRole(string $role): User
{
    $user = User::factory()->create(['is_active' => true]);
    $user->assignRole($role);

    return $user;
}

function eligibleStudentUser(AcademicPeriod $period): User
{
    $user = electionUserWithRole('student');
    $student = Student::factory()->create(['user_id' => $user->id]);

    Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'status' => PermitStatus::Active,
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDay(),
    ]);

    return $user;
}

function activeElectionFixture(): array
{
    $period = AcademicPeriod::factory()->active()->create();
    $election = Election::factory()->active()->create([
        'academic_period_id' => $period->id,
    ]);
    $position = ElectionPosition::factory()->create([
        'election_id' => $election->id,
    ]);
    $candidate = ElectionCandidate::factory()->approved()->create([
        'election_position_id' => $position->id,
    ]);

    return [$period, $election, $position, $candidate];
}

test('authorized user can create election', function () {
    $period = AcademicPeriod::factory()->create();
    $user = electionUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('elections.store'), [
            'academic_period_id' => $period->id,
            'title' => 'SRC General Elections',
        ])
        ->assertRedirect();

    $election = Election::query()->firstOrFail();

    expect($election->created_by_id)->toBe($user->id)
        ->and($election->academic_period_id)->toBe($period->id)
        ->and($election->slug)->toBe('src-general-elections')
        ->and($election->positions)->toHaveCount(0);
});

test('authorized user can export election pdf', function () {
    [, $election, $position] = activeElectionFixture();
    ElectionCandidate::factory()->approved()->create([
        'election_position_id' => $position->id,
    ]);

    $this->actingAs(electionUserWithRole('admin'))
        ->get(route('elections.export.pdf', $election))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('authorized user can add election position after creating election', function () {
    $election = Election::factory()->create();

    $this->actingAs(electionUserWithRole('admin'))
        ->post(route('elections.positions.store', $election), [
            'title' => 'SRC President',
            'description' => 'Leads the SRC executive council.',
            'max_winners' => 1,
        ])
        ->assertRedirect();

    $position = $election->positions()->firstOrFail();

    expect($position->title)->toBe('SRC President')
        ->and(AuditLog::query()->where('event', AuditEvents::ElectionPositionCreated)->exists())->toBeTrue();
});

test('authorized user can add candidate with poster to a position', function () {
    Storage::fake('public');

    [, $election, $position] = activeElectionFixture();
    $student = Student::factory()->create();

    $this->actingAs(electionUserWithRole('admin'))
        ->post(route('elections.candidates.store', [$election, $position]), [
            'student_id' => $student->id,
            'slogan' => 'Service with integrity',
            'manifesto' => 'I will improve student representation.',
            'poster' => UploadedFile::fake()->image('candidate.jpg'),
        ])
        ->assertRedirect();

    $candidate = $position->candidates()->where('student_id', $student->id)->firstOrFail();

    expect($candidate->getFirstMedia('poster'))->not->toBeNull()
        ->and(AuditLog::query()->where('event', AuditEvents::CandidateCreated)->exists())->toBeTrue();
});

test('election requires academic period', function () {
    $this->actingAs(electionUserWithRole('admin'))
        ->from(route('elections.create'))
        ->post(route('elections.store'), [
            'title' => 'SRC General Elections',
        ])
        ->assertRedirect(route('elections.create'))
        ->assertSessionHasErrors('academic_period_id');
});

test('only approved candidates can receive votes', function () {
    [$period, $election, $position] = activeElectionFixture();
    $candidate = ElectionCandidate::factory()->create([
        'election_position_id' => $position->id,
        'status' => CandidateStatus::Pending,
    ]);

    $this->actingAs(eligibleStudentUser($period))
        ->post(route('elections.vote', [$election, $position]), [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertSessionHasErrors('election_candidate_id');

    expect(ElectionVote::query()->count())->toBe(0);
});

test('one vote per position is enforced', function () {
    [$period, $election, $position, $candidate] = activeElectionFixture();
    $otherCandidate = ElectionCandidate::factory()->approved()->create([
        'election_position_id' => $position->id,
    ]);
    $studentUser = eligibleStudentUser($period);

    $this->actingAs($studentUser)
        ->post(route('elections.vote', [$election, $position]), [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertRedirect();

    $this->actingAs($studentUser)
        ->post(route('elections.vote', [$election, $position]), [
            'election_candidate_id' => $otherCandidate->id,
        ])
        ->assertSessionHasErrors('election_candidate_id');

    expect(ElectionVote::query()->where('election_position_id', $position->id)->count())->toBe(1);
});

test('inactive election rejects votes', function () {
    [$period, $election, $position, $candidate] = activeElectionFixture();
    $election->update(['status' => ElectionStatus::Closed]);

    $this->actingAs(eligibleStudentUser($period))
        ->post(route('elections.vote', [$election, $position]), [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertSessionHasErrors('election');
});

test('election closes correctly', function () {
    [, $election] = activeElectionFixture();

    $this->actingAs(electionUserWithRole('admin'))
        ->post(route('elections.close', $election))
        ->assertRedirect();

    expect($election->refresh()->status)->toBe(ElectionStatus::Closed);
});

test('election cannot publish until every position has approved candidate', function () {
    $election = Election::factory()->create();

    $this->actingAs(electionUserWithRole('admin'))
        ->post(route('elections.publish', $election))
        ->assertSessionHasErrors('election');

    $position = ElectionPosition::factory()->create(['election_id' => $election->id]);
    ElectionCandidate::factory()->create([
        'election_position_id' => $position->id,
        'status' => CandidateStatus::Pending,
    ]);

    $this->actingAs(electionUserWithRole('admin'))
        ->post(route('elections.publish', $election))
        ->assertSessionHasErrors('election');
});

test('candidate approval flow works', function () {
    [, $election, $position] = activeElectionFixture();
    $candidate = ElectionCandidate::factory()->create([
        'election_position_id' => $position->id,
        'status' => CandidateStatus::Pending,
    ]);

    $this->actingAs(electionUserWithRole('admin'))
        ->post(route('candidates.approve', $candidate))
        ->assertRedirect();

    expect($candidate->refresh()->status)->toBe(CandidateStatus::Approved)
        ->and($candidate->approved_at)->not->toBeNull();
});

test('student without active permit cannot vote', function () {
    [$period, $election, $position, $candidate] = activeElectionFixture();
    $user = electionUserWithRole('student');
    Student::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('elections.vote', [$election, $position]), [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertSessionHasErrors('student');
});

test('student without activated account cannot vote', function () {
    [$period, $election, $position, $candidate] = activeElectionFixture();
    $user = electionUserWithRole('student');
    $user->update(['password' => null]);
    Student::factory()->create(['user_id' => $user->id]);
    Permit::factory()->create([
        'student_id' => $user->student->id,
        'academic_period_id' => $period->id,
        'status' => PermitStatus::Active,
    ]);

    $this->actingAs($user)
        ->post(route('elections.vote', [$election, $position]), [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertSessionHasErrors('student');
});

test('results visibility is enforced', function () {
    [, $election] = activeElectionFixture();
    $election->update(['results_visible' => false]);

    $this->actingAs(electionUserWithRole('student'))
        ->get(route('elections.show', $election))
        ->assertInertia(fn (Assert $page) => $page
            ->component('elections/show')
            ->where('can.view_results', false)
            ->where('election.positions.0.candidates.0.votes_count', null));
});

test('audit logs are created', function () {
    $admin = electionUserWithRole('admin');
    [$period, $election, $position, $candidate] = activeElectionFixture();

    $this->actingAs($admin)
        ->post(route('elections.start', $election))
        ->assertRedirect();

    $this->actingAs($admin)
        ->post(route('candidates.approve', $candidate))
        ->assertRedirect();

    $this->actingAs(eligibleStudentUser($period))
        ->post(route('elections.vote', [$election, $position]), [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertRedirect();

    expect(AuditLog::query()->where('event', AuditEvents::ElectionStarted)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('event', AuditEvents::CandidateApproved)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('event', AuditEvents::ElectionVoteCast)->exists())->toBeTrue();
});

test('duplicate vote transaction is blocked', function () {
    [$period, $election, $position, $candidate] = activeElectionFixture();
    $studentUser = eligibleStudentUser($period);

    app(CastElectionVoteAction::class)->handle($election, $position, $candidate, $studentUser);

    expect(fn () => app(CastElectionVoteAction::class)->handle($election, $position, $candidate, $studentUser))
        ->toThrow(ValidationException::class);

    expect(ElectionVote::query()->where('election_position_id', $position->id)->count())->toBe(1);
});
