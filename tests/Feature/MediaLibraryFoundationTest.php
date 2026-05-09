<?php

use App\Support\MediaCollections;
use Illuminate\Support\Facades\Schema;

test('media library foundation is configured', function () {
    expect(Schema::hasTable('media'))->toBeTrue()
        ->and(config('media-library.disk_name'))->toBe('public')
        ->and(config('media-library.queue_conversions_by_default'))->toBeTrue()
        ->and(config('media-library.media_model'))->toBeString();
});

test('media collection names are centralized', function () {
    expect(MediaCollections::AVATAR)->toBe('avatar')
        ->and(MediaCollections::FEATURED_IMAGE)->toBe('featured_image')
        ->and(MediaCollections::GALLERY)->toBe('gallery')
        ->and(MediaCollections::BANNER)->toBe('banner')
        ->and(MediaCollections::FILES)->toBe('files')
        ->and(MediaCollections::ATTACHMENTS)->toBe('attachments');
});
