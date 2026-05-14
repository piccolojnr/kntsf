<?php

namespace App\Support;

final class MediaCollections
{
    public const AVATAR = 'avatar';

    public const FEATURED_IMAGE = 'featured_image';

    public const GALLERY = 'gallery';

    public const BANNER = 'banner';

    public const FILES = 'files';

    public const ATTACHMENTS = 'attachments';

    /**
     * @return array<int, string>
     */
    public static function contentCollections(): array
    {
        return [
            self::FEATURED_IMAGE,
            self::BANNER,
            self::GALLERY,
            self::ATTACHMENTS,
        ];
    }
}
