<?php

namespace App\Support;

class MediaConversions
{
    public const THUMB = 'thumb';

    public const PREVIEW = 'preview';

    public const HERO = 'hero';

    /**
     * @return array<int, string>
     */
    public static function plannedImageConversions(): array
    {
        return [
            self::THUMB,
            self::PREVIEW,
            self::HERO,
        ];
    }
}
