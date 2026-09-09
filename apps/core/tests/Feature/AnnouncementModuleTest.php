<?php

use App\Actions\Announcements\PublishAnnouncementAction;
use App\Enums\PublishStatus;
use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\Publishing;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function announcementUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('authorized user can create announcement', function () {
    $user = announcementUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('announcements.store'), [
            'title' => 'Campus Town Hall',
            'content' => 'All students are invited.',
            'status' => 'draft',
            'visibility' => 'public',
        ])
        ->assertRedirect();

    $announcement = Announcement::query()->firstOrFail();

    expect($announcement->author_id)->toBe($user->id)
        ->and($announcement->title)->toBe('Campus Town Hall')
        ->and($announcement->slug)->toBe('campus-town-hall')
        ->and($announcement->status)->toBe(PublishStatus::Draft);
});

test('unauthorized user cannot create announcement', function () {
    $this->actingAs(announcementUserWithRole('student'))
        ->post(route('announcements.store'), [
            'title' => 'Campus Town Hall',
            'content' => 'All students are invited.',
        ])
        ->assertForbidden();
});

test('slug is generated uniquely', function () {
    Announcement::factory()->create([
        'slug' => 'campus-town-hall',
    ]);

    $this->actingAs(announcementUserWithRole('admin'))
        ->post(route('announcements.store'), [
            'title' => 'Campus Town Hall',
            'content' => 'All students are invited.',
        ])
        ->assertRedirect();

    expect(Announcement::query()->where('slug', 'campus-town-hall-2')->exists())->toBeTrue();
});

test('announcement can be published', function () {
    $announcement = Announcement::factory()->create([
        'status' => PublishStatus::Draft,
        'published_at' => null,
    ]);
    $user = announcementUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('announcements.publish', $announcement))
        ->assertRedirect();

    expect($announcement->refresh()->status)->toBe(PublishStatus::Published)
        ->and($announcement->published_at)->not->toBeNull();
});

test('announcement can be archived', function () {
    $announcement = Announcement::factory()->published()->create();

    $this->actingAs(announcementUserWithRole('admin'))
        ->post(route('announcements.archive', $announcement))
        ->assertRedirect();

    expect($announcement->refresh()->status)->toBe(PublishStatus::Archived)
        ->and($announcement->archived_at)->not->toBeNull();
});

test('unpublished announcements are excluded from published helper scope', function () {
    Announcement::factory()->create([
        'status' => PublishStatus::Draft,
    ]);
    $published = Announcement::factory()->published()->create();

    $results = app(Publishing::class)
        ->publishedScope(Announcement::query(), 'status')
        ->pluck('id')
        ->all();

    expect($results)->toBe([$published->id]);
});

test('media upload fields validate images', function () {
    $this->actingAs(announcementUserWithRole('admin'))
        ->from(route('announcements.create'))
        ->post(route('announcements.store'), [
            'title' => 'Campus Town Hall',
            'content' => 'All students are invited.',
            'featured_image' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf'),
        ])
        ->assertRedirect(route('announcements.create'))
        ->assertSessionHasErrors('featured_image');
});

test('audit log is created for announcement lifecycle', function () {
    $user = announcementUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('announcements.store'), [
            'title' => 'Campus Town Hall',
            'content' => 'All students are invited.',
        ])
        ->assertRedirect();

    $announcement = Announcement::query()->firstOrFail();

    app(PublishAnnouncementAction::class)->handle($announcement, $user);

    expect(AuditLog::query()->where('event', AuditEvents::AnnouncementCreated)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('event', AuditEvents::AnnouncementPublished)->exists())->toBeTrue();
});
