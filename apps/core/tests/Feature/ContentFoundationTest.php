<?php

use App\Enums\PublishStatus;
use App\Models\AppSetting;
use App\Support\ContentSettings;
use App\Support\MediaCollections;
use App\Support\MediaConversions;
use App\Support\Publishing;
use App\Support\SlugGenerator;
use Database\Seeders\ContentSettingsSeeder;

test('slug generator creates unique reusable slugs', function () {
    AppSetting::query()->create([
        'key' => 'student-election',
        'value' => [],
    ]);

    AppSetting::query()->create([
        'key' => 'student-election-2',
        'value' => [],
    ]);

    $slug = app(SlugGenerator::class)->generate('Student Election', AppSetting::class, 'key');

    expect($slug)->toBe('student-election-3');
});

test('slug generator can ignore current record', function () {
    $setting = AppSetting::query()->create([
        'key' => 'campus-news',
        'value' => [],
    ]);

    $slug = app(SlugGenerator::class)->generate('Campus News', AppSetting::class, 'key', $setting->id);

    expect($slug)->toBe('campus-news');
});

test('publishing helper resolves status behavior', function () {
    $publishing = app(Publishing::class);

    expect($publishing->isPublished(PublishStatus::Published, now()->subMinute()))->toBeTrue()
        ->and($publishing->isPublished(PublishStatus::Published, now()->addMinute()))->toBeFalse()
        ->and($publishing->isScheduled(PublishStatus::Scheduled))->toBeTrue()
        ->and($publishing->isDraft(PublishStatus::Draft))->toBeTrue()
        ->and($publishing->isArchived(PublishStatus::Archived))->toBeTrue();
});

test('content settings defaults load and can be seeded', function () {
    $this->seed(ContentSettingsSeeder::class);

    $settings = app(ContentSettings::class)->all();

    expect($settings['allow_public_news'])->toBeTrue()
        ->and($settings['allow_public_events'])->toBeTrue()
        ->and($settings['allow_public_documents'])->toBeFalse()
        ->and($settings['homepage_featured_limit'])->toBe(6)
        ->and($settings['enable_comments'])->toBeFalse();

    $this->assertDatabaseHas('app_settings', [
        'key' => ContentSettings::SettingKey,
    ]);
});

test('content media conventions are centralized', function () {
    expect(MediaCollections::contentCollections())->toBe([
        MediaCollections::FEATURED_IMAGE,
        MediaCollections::BANNER,
        MediaCollections::GALLERY,
        MediaCollections::ATTACHMENTS,
    ])
        ->and(MediaConversions::plannedImageConversions())->toBe([
            MediaConversions::THUMB,
            MediaConversions::PREVIEW,
            MediaConversions::HERO,
        ]);
});
