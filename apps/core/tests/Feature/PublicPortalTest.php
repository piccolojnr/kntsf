<?php

use App\Enums\CandidateStatus;
use App\Enums\ElectionStatus;
use App\Enums\Visibility;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\ElectionVote;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Models\Student;
use Inertia\Testing\AssertableInertia as Assert;

test('draft announcements are not publicly visible', function () {
    $announcement = Announcement::factory()->create(['slug' => 'draft-src-update']);

    $this->get(route('public.announcements.show', $announcement))->assertNotFound();
});

test('internal announcements are not publicly visible', function () {
    $announcement = Announcement::factory()
        ->published()
        ->create([
            'slug' => 'internal-src-update',
            'visibility' => Visibility::Internal,
        ]);

    $this->get(route('public.announcements.show', $announcement))->assertNotFound();
});

test('public announcement slugs resolve', function () {
    $announcement = Announcement::factory()
        ->published()
        ->create(['slug' => 'public-src-update']);

    $this->get(route('public.announcements.show', $announcement))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/announcements/show')
            ->where('announcement.slug', 'public-src-update'));
});

test('unpublished events and documents return not found', function () {
    $event = Event::factory()->create(['slug' => 'draft-event']);
    $document = Document::factory()->create(['slug' => 'draft-document']);

    $this->get(route('public.events.show', $event))->assertNotFound();
    $this->get(route('public.documents.show', $document))->assertNotFound();
});

test('public executive page only shows published profiles', function () {
    $published = ExecutiveProfile::factory()->create(['position' => 'President']);
    ExecutiveProfile::factory()->create([
        'position' => 'Hidden Secretary',
        'is_published' => false,
    ]);

    $this->get(route('public.executives.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/executives/index')
            ->has('executives', 1)
            ->where('executives.0.id', $published->id));
});

test('public election results visibility is enforced', function () {
    $election = Election::factory()->active()->create([
        'slug' => 'src-election',
        'results_visible' => false,
    ]);
    $position = ElectionPosition::factory()->create(['election_id' => $election->id]);
    $candidate = ElectionCandidate::factory()->create([
        'election_position_id' => $position->id,
        'status' => CandidateStatus::Approved,
    ]);
    ElectionVote::factory()->create([
        'election_id' => $election->id,
        'election_position_id' => $position->id,
        'election_candidate_id' => $candidate->id,
        'student_id' => Student::factory()->create()->id,
    ]);

    $this->get(route('public.elections.show', $election))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/elections/show')
            ->where('election.votes_count', null)
            ->where('election.positions.0.candidates.0.votes_count', null));

    $election->update(['results_visible' => true]);

    $this->get(route('public.elections.show', $election))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('election.votes_count', 1)
            ->where('election.positions.0.candidates.0.votes_count', 1));
});

test('draft elections are not public', function () {
    $election = Election::factory()->create([
        'slug' => 'draft-election',
        'status' => ElectionStatus::Draft,
    ]);

    $this->get(route('public.elections.show', $election))->assertNotFound();
});
