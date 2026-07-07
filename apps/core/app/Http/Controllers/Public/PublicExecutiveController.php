<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ExecutiveProfile;
use App\Support\ApplicationCache;
use App\Support\MediaCollections;
use Inertia\Inertia;
use Inertia\Response;

class PublicExecutiveController extends Controller
{
    public function __invoke(ApplicationCache $cache): Response
    {
        return Inertia::render('public/executives/index', [
            'executives' => $cache->remember(
                ApplicationCache::PublicExecutives,
                'index',
                300,
                fn () => ExecutiveProfile::query()
                    ->published()
                    ->with(['user:id,name', 'media'])
                    ->orderBy('sort_order')
                    ->get()
                    ->map(fn (ExecutiveProfile $profile): array => self::payload($profile))
                    ->values()
                    ->all(),
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function payload(ExecutiveProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'name' => $profile->user?->name,
            'position' => $profile->position,
            'position_description' => $profile->position_description,
            'biography' => $profile->biography,
            'category' => $profile->category,
            'avatar_url' => $profile->getFirstMediaUrl(MediaCollections::AVATAR) ?: null,
        ];
    }
}
