<?php

namespace App\Support;

use App\Models\AppSetting;

class ContentSettings
{
    public const SettingKey = 'content.settings';

    public function __construct(private readonly ApplicationCache $cache) {}

    /**
     * @return array{allow_public_news: bool, allow_public_events: bool, allow_public_documents: bool, homepage_featured_limit: int, enable_comments: bool}
     */
    public function all(): array
    {
        return $this->cache->remember(
            ApplicationCache::ContentSettings,
            'default',
            300,
            function (): array {
                $stored = AppSetting::query()
                    ->where('key', self::SettingKey)
                    ->value('value');

                return $this->normalize(is_array($stored) ? $stored : []);
            },
        );
    }

    /**
     * @param  array{allow_public_news?: mixed, allow_public_events?: mixed, allow_public_documents?: mixed, homepage_featured_limit?: mixed, enable_comments?: mixed}  $settings
     * @return array{allow_public_news: bool, allow_public_events: bool, allow_public_documents: bool, homepage_featured_limit: int, enable_comments: bool}
     */
    public function update(array $settings): array
    {
        $normalized = $this->normalize($settings);

        AppSetting::query()->updateOrCreate([
            'key' => self::SettingKey,
        ], [
            'value' => $normalized,
        ]);

        $this->cache->flushSettings();

        return $normalized;
    }

    /**
     * @return array{allow_public_news: bool, allow_public_events: bool, allow_public_documents: bool, homepage_featured_limit: int, enable_comments: bool}
     */
    public function defaults(): array
    {
        return [
            'allow_public_news' => true,
            'allow_public_events' => true,
            'allow_public_documents' => false,
            'homepage_featured_limit' => 6,
            'enable_comments' => false,
        ];
    }

    /**
     * @param  array{allow_public_news?: mixed, allow_public_events?: mixed, allow_public_documents?: mixed, homepage_featured_limit?: mixed, enable_comments?: mixed}  $settings
     * @return array{allow_public_news: bool, allow_public_events: bool, allow_public_documents: bool, homepage_featured_limit: int, enable_comments: bool}
     */
    private function normalize(array $settings): array
    {
        $settings = array_replace($this->defaults(), $settings);

        return [
            'allow_public_news' => (bool) $settings['allow_public_news'],
            'allow_public_events' => (bool) $settings['allow_public_events'],
            'allow_public_documents' => (bool) $settings['allow_public_documents'],
            'homepage_featured_limit' => max(1, (int) $settings['homepage_featured_limit']),
            'enable_comments' => (bool) $settings['enable_comments'],
        ];
    }
}
