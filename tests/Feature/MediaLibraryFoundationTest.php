<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

uses(RefreshDatabase::class);

beforeEach(function () {
    Schema::create('media_library_test_models', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->timestamps();
    });
});

test('media library can attach files to media models', function () {
    Storage::fake('public');
    config(['media-library.disk_name' => 'public']);

    $model = MediaLibraryTestModel::query()->create([
        'name' => 'Foundation media holder',
    ]);

    $media = $model
        ->addMedia(UploadedFile::fake()->create('foundation.pdf', 12, 'application/pdf'))
        ->toMediaCollection('documents');

    expect($model->getMedia('documents'))->toHaveCount(1)
        ->and($media->collection_name)->toBe('documents')
        ->and($media->disk)->toBe('public')
        ->and($media->file_name)->toBe('foundation.pdf');

    Storage::disk('public')->assertExists($media->getPathRelativeToRoot());
});

class MediaLibraryTestModel extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = [];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk('public');
    }
}
