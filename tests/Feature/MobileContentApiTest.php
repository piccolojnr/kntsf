<?php

use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Models\User;
use App\Support\ContentSettings;
use App\Support\MediaCollections;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

function mobileContentToken(): string
{
    $user = User::factory()->create([
        'password' => Hash::make('Password123!'),
    ]);

    return $user->createToken('test-mobile', ['mobile'])->plainTextToken;
}

beforeEach(function (): void {
    app(ContentSettings::class)->update([
        'allow_public_news' => true,
        'allow_public_events' => true,
        'allow_public_documents' => true,
        'homepage_featured_limit' => 4,
    ]);
});

test('mobile content home returns published public content', function () {
    $announcement = Announcement::factory()->published()->create([
        'title' => 'Featured announcement',
        'is_featured' => true,
    ]);
    $event = Event::factory()->published()->create([
        'title' => 'Upcoming event',
        'starts_at' => now()->addDays(3),
    ]);
    $document = Document::factory()->published()->create([
        'title' => 'Featured document',
        'is_featured' => true,
    ]);
    $executive = ExecutiveProfile::factory()->create([
        'position' => 'President',
    ]);

    $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/home')
        ->assertOk()
        ->assertJsonPath('announcements.0.title', $announcement->title)
        ->assertJsonPath('events.0.title', $event->title)
        ->assertJsonPath('documents.0.title', $document->title)
        ->assertJsonPath('executives.0.position', $executive->position);
});

test('draft announcements are hidden from mobile content', function () {
    Announcement::factory()->create(['title' => 'Draft announcement']);
    $published = Announcement::factory()->published()->create(['title' => 'Published announcement']);

    $response = $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/announcements')
        ->assertOk()
        ->assertJsonPath('data.0.title', $published->title);

    expect($response->getContent())->not->toContain('Draft announcement');
});

test('internal events are hidden from mobile content', function () {
    Event::factory()->published()->create([
        'title' => 'Internal event',
        'visibility' => Visibility::Internal,
    ]);
    $publicEvent = Event::factory()->published()->create(['title' => 'Public event']);

    $response = $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/events')
        ->assertOk()
        ->assertJsonPath('data.0.title', $publicEvent->title);

    expect($response->getContent())->not->toContain('Internal event');
});

test('unpublished documents are hidden from mobile content', function () {
    Document::factory()->create(['title' => 'Draft document']);
    $published = Document::factory()->published()->create(['title' => 'Published document']);

    $response = $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/documents')
        ->assertOk()
        ->assertJsonPath('data.0.title', $published->title);

    expect($response->getContent())->not->toContain('Draft document');
});

test('executives only include published profiles', function () {
    ExecutiveProfile::factory()->create([
        'position' => 'Hidden Officer',
        'is_published' => false,
    ]);
    $published = ExecutiveProfile::factory()->create([
        'position' => 'Published Officer',
        'is_published' => true,
    ]);

    $response = $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/executives')
        ->assertOk()
        ->assertJsonPath('data.0.position', $published->position);

    expect($response->getContent())->not->toContain('Hidden Officer');
});

test('document resource does not expose private or unpublished files', function () {
    Storage::fake('public');

    $published = Document::factory()->published()->create(['title' => 'Public handbook']);
    $published->addMedia(UploadedFile::fake()->create('public-handbook.pdf', 64, 'application/pdf'))
        ->toMediaCollection(MediaCollections::FILES, 'public');

    $draft = Document::factory()->create(['title' => 'Private draft']);
    $draft->addMedia(UploadedFile::fake()->create('private-draft.pdf', 64, 'application/pdf'))
        ->toMediaCollection(MediaCollections::FILES, 'public');

    $response = $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/documents/'.$published->slug)
        ->assertOk()
        ->assertJsonPath('data.title', 'Public handbook')
        ->assertJsonPath('data.files.0.file_name', 'public-handbook.pdf')
        ->assertJsonMissingPath('data.metadata');

    expect($response->getContent())->not->toContain('private-draft.pdf')
        ->not->toContain('Private draft');
});

test('mobile content pagination works', function () {
    Announcement::factory()
        ->count(12)
        ->published()
        ->sequence(fn (Sequence $sequence): array => [
            'title' => 'Announcement '.$sequence->index,
            'published_at' => now()->subMinutes($sequence->index + 1),
        ])
        ->create();

    $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/announcements?per_page=5')
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.total', 12);
});

test('slug show returns not found for unpublished or internal content', function () {
    $draftAnnouncement = Announcement::factory()->create([
        'status' => PublishStatus::Draft,
        'slug' => 'draft-mobile-post',
    ]);
    $internalEvent = Event::factory()->published()->create([
        'visibility' => Visibility::Internal,
        'slug' => 'internal-mobile-event',
    ]);

    $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/announcements/'.$draftAnnouncement->slug)
        ->assertNotFound();

    $this->withToken(mobileContentToken())
        ->getJson('/api/mobile/content/events/'.$internalEvent->slug)
        ->assertNotFound();
});
