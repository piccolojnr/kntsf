<?php

use App\Actions\Documents\PublishDocumentAction;
use App\Enums\PublishStatus;
use App\Models\AuditLog;
use App\Models\Document;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function documentUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('authorized user can create document', function () {
    $user = documentUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('documents.store'), [
            'title' => 'SRC Constitution',
            'description' => 'Main governance document.',
            'status' => 'draft',
            'visibility' => 'public',
        ])
        ->assertRedirect();

    $document = Document::query()->firstOrFail();

    expect($document->author_id)->toBe($user->id)
        ->and($document->title)->toBe('SRC Constitution')
        ->and($document->slug)->toBe('src-constitution')
        ->and($document->status)->toBe(PublishStatus::Draft);
});

test('unauthorized user cannot create document', function () {
    $this->actingAs(documentUserWithRole('student'))
        ->post(route('documents.store'), [
            'title' => 'SRC Constitution',
        ])
        ->assertForbidden();
});

test('document slug is generated uniquely', function () {
    Document::factory()->create([
        'slug' => 'src-constitution',
    ]);

    $this->actingAs(documentUserWithRole('admin'))
        ->post(route('documents.store'), [
            'title' => 'SRC Constitution',
        ])
        ->assertRedirect();

    expect(Document::query()->where('slug', 'src-constitution-2')->exists())->toBeTrue();
});

test('file upload validation rejects unsupported files', function () {
    $this->actingAs(documentUserWithRole('admin'))
        ->from(route('documents.create'))
        ->post(route('documents.store'), [
            'title' => 'SRC Constitution',
            'files' => [
                UploadedFile::fake()->image('photo.jpg'),
            ],
        ])
        ->assertRedirect(route('documents.create'))
        ->assertSessionHasErrors('files.0');
});

test('publishing requires attached file', function () {
    $document = Document::factory()->create([
        'status' => PublishStatus::Draft,
        'published_at' => null,
    ]);

    $this->actingAs(documentUserWithRole('admin'))
        ->post(route('documents.publish', $document))
        ->assertSessionHasErrors('files');

    expect($document->refresh()->status)->toBe(PublishStatus::Draft);
});

test('document can publish and archive', function () {
    $document = Document::factory()->create([
        'status' => PublishStatus::Draft,
        'published_at' => null,
    ]);
    $document
        ->addMedia(UploadedFile::fake()->create('constitution.pdf', 100, 'application/pdf'))
        ->toMediaCollection(MediaCollections::FILES);

    $this->actingAs(documentUserWithRole('admin'))
        ->post(route('documents.publish', $document))
        ->assertRedirect();

    expect($document->refresh()->status)->toBe(PublishStatus::Published)
        ->and($document->published_at)->not->toBeNull();

    $this->actingAs(documentUserWithRole('admin'))
        ->post(route('documents.archive', $document))
        ->assertRedirect();

    expect($document->refresh()->status)->toBe(PublishStatus::Archived)
        ->and($document->archived_at)->not->toBeNull();
});

test('media files attach correctly', function () {
    $this->actingAs(documentUserWithRole('admin'))
        ->post(route('documents.store'), [
            'title' => 'SRC Constitution',
            'files' => [
                UploadedFile::fake()->create('constitution.pdf', 100, 'application/pdf'),
            ],
        ])
        ->assertRedirect();

    $document = Document::query()->firstOrFail();

    expect($document->hasMedia(MediaCollections::FILES))->toBeTrue()
        ->and($document->getMedia(MediaCollections::FILES))->toHaveCount(1);
});

test('audit logs are created for document lifecycle', function () {
    $user = documentUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('documents.store'), [
            'title' => 'SRC Constitution',
            'files' => [
                UploadedFile::fake()->create('constitution.pdf', 100, 'application/pdf'),
            ],
        ])
        ->assertRedirect();

    $document = Document::query()->firstOrFail();

    app(PublishDocumentAction::class)->handle($document, $user);

    expect(AuditLog::query()->where('event', AuditEvents::DocumentCreated)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('event', AuditEvents::DocumentPublished)->exists())->toBeTrue();
});
