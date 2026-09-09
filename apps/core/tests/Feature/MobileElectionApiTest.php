<?php

use App\Enums\CandidateStatus;
use App\Enums\ElectionStatus;
use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\ElectionVote;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function mobileElectionStudentUser(?AcademicPeriod $period = null, bool $withPermit = true): User
{
    $user = User::factory()->create([
        'is_active' => true,
        'password' => Hash::make('Password123!'),
    ]);
    $user->assignRole('student');

    $student = Student::factory()->create(['user_id' => $user->id]);

    if ($withPermit && $period instanceof AcademicPeriod) {
        Permit::factory()->create([
            'student_id' => $student->id,
            'academic_period_id' => $period->id,
            'status' => PermitStatus::Active,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addDay(),
        ]);
    }

    return $user;
}

function mobileElectionToken(User $user): string
{
    return $user->createToken('test-mobile', ['mobile'])->plainTextToken;
}

function mobileElectionFixture(array $electionAttributes = []): array
{
    $period = AcademicPeriod::factory()->active()->create();
    $election = Election::factory()->active()->create([
        'academic_period_id' => $period->id,
        ...$electionAttributes,
    ]);
    $position = ElectionPosition::factory()->create([
        'election_id' => $election->id,
    ]);
    $candidate = ElectionCandidate::factory()->approved()->create([
        'election_position_id' => $position->id,
    ]);

    return [$period, $election, $position, $candidate];
}

test('student can list active elections', function () {
    [$period, $election] = mobileElectionFixture();
    $user = mobileElectionStudentUser($period);

    $this->withToken(mobileElectionToken($user))
        ->getJson('/api/mobile/elections')
        ->assertOk()
        ->assertJsonPath('data.0.id', $election->id)
        ->assertJsonPath('data.0.status', ElectionStatus::Active->value)
        ->assertJsonPath('data.0.has_voted', false)
        ->assertJsonPath('data.0.results_visible', false);
});

test('student can view election detail', function () {
    [$period, $election, $position, $candidate] = mobileElectionFixture();
    $user = mobileElectionStudentUser($period);

    $this->withToken(mobileElectionToken($user))
        ->getJson("/api/mobile/elections/{$election->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $election->id)
        ->assertJsonPath('data.eligibility.eligible', true)
        ->assertJsonPath('data.positions.0.id', $position->id)
        ->assertJsonPath('data.positions.0.candidates.0.id', $candidate->id);
});

test('only approved candidates are returned', function () {
    [$period, $election, $position, $approvedCandidate] = mobileElectionFixture();
    $pendingCandidate = ElectionCandidate::factory()->create([
        'election_position_id' => $position->id,
        'status' => CandidateStatus::Pending,
    ]);
    $user = mobileElectionStudentUser($period);

    $response = $this->withToken(mobileElectionToken($user))
        ->getJson("/api/mobile/elections/{$election->id}")
        ->assertOk()
        ->assertJsonPath('data.positions.0.candidates.0.id', $approvedCandidate->id);

    expect(collect($response->json('data.positions.0.candidates'))->pluck('id')->all())
        ->toBe([$approvedCandidate->id])
        ->not->toContain($pendingCandidate->id);
});

test('student with active permit can vote', function () {
    [$period, $election, $position, $candidate] = mobileElectionFixture();
    $user = mobileElectionStudentUser($period);

    $this->withToken(mobileElectionToken($user))
        ->postJson("/api/mobile/elections/{$election->id}/positions/{$position->id}/vote", [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertOk()
        ->assertJsonPath('data.positions.0.has_voted', true);

    expect(ElectionVote::query()->where('student_id', $user->student->id)->count())->toBe(1);
});

test('student without active permit cannot vote', function () {
    [, $election, $position, $candidate] = mobileElectionFixture();
    $user = mobileElectionStudentUser(null, false);

    $this->withToken(mobileElectionToken($user))
        ->postJson("/api/mobile/elections/{$election->id}/positions/{$position->id}/vote", [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('student');

    expect(ElectionVote::query()->count())->toBe(0);
});

test('student cannot vote twice for same position', function () {
    [$period, $election, $position, $candidate] = mobileElectionFixture();
    $otherCandidate = ElectionCandidate::factory()->approved()->create([
        'election_position_id' => $position->id,
    ]);
    $user = mobileElectionStudentUser($period);

    $this->withToken(mobileElectionToken($user))
        ->postJson("/api/mobile/elections/{$election->id}/positions/{$position->id}/vote", [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertOk();

    $this->withToken(mobileElectionToken($user))
        ->postJson("/api/mobile/elections/{$election->id}/positions/{$position->id}/vote", [
            'election_candidate_id' => $otherCandidate->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('election_candidate_id');
});

test('student cannot vote for candidate outside position', function () {
    [$period, $election, $position] = mobileElectionFixture();
    $otherPosition = ElectionPosition::factory()->create(['election_id' => $election->id]);
    $outsideCandidate = ElectionCandidate::factory()->approved()->create([
        'election_position_id' => $otherPosition->id,
    ]);
    $user = mobileElectionStudentUser($period);

    $this->withToken(mobileElectionToken($user))
        ->postJson("/api/mobile/elections/{$election->id}/positions/{$position->id}/vote", [
            'election_candidate_id' => $outsideCandidate->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('election_candidate_id');
});

test('closed election rejects vote', function () {
    [$period, $election, $position, $candidate] = mobileElectionFixture([
        'status' => ElectionStatus::Closed,
        'starts_at' => now()->subDays(3),
        'ends_at' => now()->subDay(),
    ]);
    $user = mobileElectionStudentUser($period);

    $this->withToken(mobileElectionToken($user))
        ->postJson("/api/mobile/elections/{$election->id}/positions/{$position->id}/vote", [
            'election_candidate_id' => $candidate->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('election');
});

test('results hidden when results visible is false', function () {
    [$period, $election] = mobileElectionFixture(['results_visible' => false]);
    $user = mobileElectionStudentUser($period);

    $this->withToken(mobileElectionToken($user))
        ->getJson("/api/mobile/elections/{$election->id}/results")
        ->assertForbidden();
});

test('results visible when enabled', function () {
    [$period, $election, $position, $candidate] = mobileElectionFixture(['results_visible' => true]);
    $user = mobileElectionStudentUser($period);
    ElectionVote::factory()->create([
        'election_id' => $election->id,
        'election_position_id' => $position->id,
        'election_candidate_id' => $candidate->id,
        'student_id' => $user->student->id,
    ]);

    $this->withToken(mobileElectionToken($user))
        ->getJson("/api/mobile/elections/{$election->id}/results")
        ->assertOk()
        ->assertJsonPath('data.positions.0.candidates.0.id', $candidate->id)
        ->assertJsonPath('data.positions.0.candidates.0.votes_count', 1)
        ->assertJsonPath('data.positions.0.total_votes', 1);
});

test('raw internal metadata is not exposed', function () {
    [$period, $election] = mobileElectionFixture([
        'metadata' => ['internal_notes' => 'hidden'],
    ]);
    $user = mobileElectionStudentUser($period);

    $response = $this->withToken(mobileElectionToken($user))
        ->getJson("/api/mobile/elections/{$election->id}")
        ->assertOk()
        ->assertJsonMissing(['metadata']);

    expect($response->getContent())->not->toContain('internal_notes');
});
