<?php

use App\Models\Announcement;
use App\Models\Document;
use App\Models\Event;
use App\Support\ContentSettings;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

test('public content index pages return published records', function () {
    $announcement = Announcement::factory()->published()->create([
        'title' => 'Matriculation Week Notice',
    ]);
    $event = Event::factory()->published()->create([
        'title' => 'SRC Leadership Forum',
    ]);
    $document = Document::factory()->published()->create([
        'title' => 'Student Welfare Policy',
    ]);

    $this->get(route('public.announcements.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/announcements/index')
            ->where('announcements.data.0.id', $announcement->id));

    $this->get(route('public.events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/events/index')
            ->where('events.data.0.id', $event->id));

    $this->get(route('public.documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/documents/index')
            ->where('documents.data.0.id', $document->id));
});

test('public content index cache survives hard reloads', function () {
    config(['cache.default' => 'file']);
    Cache::setDefaultDriver('file');
    Cache::flush();

    $announcement = Announcement::factory()->published()->create([
        'title' => 'Repeated Reload Notice',
    ]);
    $event = Event::factory()->published()->create([
        'title' => 'Repeated Reload Event',
    ]);

    $this->get(route('public.announcements.index'))->assertOk();
    $this->get(route('public.events.index'))->assertOk();

    $this->get(route('public.announcements.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('announcements.data.0.id', $announcement->id)
            ->missing('announcements.__PHP_Incomplete_Class_Name'));

    $this->get(route('public.events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('events.data.0.id', $event->id)
            ->missing('events.__PHP_Incomplete_Class_Name'));
});

test('home page includes recent public content even when it is not featured', function () {
    $announcement = Announcement::factory()->published()->create([
        'title' => 'Campus Shuttle Update',
        'is_featured' => false,
    ]);
    $document = Document::factory()->published()->create([
        'title' => 'Academic Appeals Guide',
        'is_featured' => false,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('announcements.0.id', $announcement->id)
            ->where('documents.0.id', $document->id));
});

test('home page counts recent published documents', function () {
    Document::factory()
        ->count(5)
        ->published()
        ->sequence(fn (Sequence $sequence): array => [
            'title' => 'Public Document '.($sequence->index + 1),
            'published_at' => now()->subMinutes($sequence->index + 1),
        ])
        ->create();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('documents', 5));
});

test('public content routes use the public namespace and old urls redirect', function () {
    $announcement = Announcement::factory()->published()->create([
        'slug' => 'campus-notice',
    ]);
    $event = Event::factory()->published()->create([
        'slug' => 'leadership-forum',
    ]);
    $document = Document::factory()->published()->create([
        'slug' => 'student-policy',
    ]);

    expect(route('public.announcements.index', absolute: false))->toBe('/public/announcements')
        ->and(route('public.events.index', absolute: false))->toBe('/public/events')
        ->and(route('public.documents.index', absolute: false))->toBe('/public/documents');

    $this->get('/announcements')->assertRedirect('/public/announcements');
    $this->get('/announcements/'.$announcement->slug)->assertRedirect(route('public.announcements.show', $announcement));
    $this->get('/events/public')->assertRedirect('/public/events');
    $this->get('/events/public/'.$event->slug)->assertRedirect(route('public.events.show', $event));
    $this->get('/documents/public')->assertRedirect('/public/documents');
    $this->get('/documents/public/'.$document->slug)->assertRedirect(route('public.documents.show', $document));
});

test('public content settings gate public web content consistently', function () {
    app(ContentSettings::class)->update([
        'allow_public_news' => false,
        'allow_public_events' => false,
        'allow_public_documents' => false,
    ]);

    $this->get(route('public.announcements.index'))->assertNotFound();
    $this->get(route('public.events.index'))->assertNotFound();
    $this->get(route('public.documents.index'))->assertNotFound();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('announcements', [])
            ->where('events', [])
            ->where('documents', []));
});
