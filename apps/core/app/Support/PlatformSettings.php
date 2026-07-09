<?php

namespace App\Support;

use App\Models\PlatformSetting;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

class PlatformSettings
{
    public const SettingKey = 'platform.integrations';

    public function __construct(private readonly ApplicationCache $cache) {}

    /**
     * @return array{paystack: array{public_key: string|null, secret_key: string|null, webhook_secret: string|null, payment_url: string}, mail: array{mailer: string, host: string|null, port: int|null, scheme: string|null, username: string|null, password: string|null, from_address: string, from_name: string}}
     */
    public function all(): array
    {
        return $this->cache->remember(
            ApplicationCache::PlatformSettings,
            'default',
            300,
            fn (): array => $this->normalize(array_replace_recursive($this->defaults(), $this->stored())),
        );
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array{paystack: array{public_key: string|null, secret_key: string|null, webhook_secret: string|null, payment_url: string}, mail: array{mailer: string, host: string|null, port: int|null, scheme: string|null, username: string|null, password: string|null, from_address: string, from_name: string}}
     */
    public function update(array $settings): array
    {
        $stored = $this->stored();
        $changes = $this->changes($settings);
        $normalized = $this->normalizeForStorage(array_replace_recursive($stored, $changes));

        PlatformSetting::query()->updateOrCreate([
            'key' => self::SettingKey,
        ], [
            'value' => $normalized,
        ]);

        $this->cache->flushSettings();

        return $this->all();
    }

    public function applyToConfig(): void
    {
        try {
            if (! Schema::hasTable('platform_settings')) {
                return;
            }

            $settings = $this->all();
        } catch (Throwable $exception) {
            Log::debug('Platform settings could not be loaded.', [
                'error' => $exception->getMessage(),
            ]);

            return;
        }

        config([
            'services.paystack.public_key' => $settings['paystack']['public_key'],
            'services.paystack.secret_key' => $settings['paystack']['secret_key'],
            'services.paystack.webhook_secret' => $settings['paystack']['webhook_secret'],
            'services.paystack.payment_url' => $settings['paystack']['payment_url'],
            'mail.default' => $settings['mail']['mailer'],
            'mail.mailers.smtp.host' => $settings['mail']['host'],
            'mail.mailers.smtp.port' => $settings['mail']['port'],
            'mail.mailers.smtp.scheme' => $this->mailSchemeForConfig($settings['mail']['scheme']),
            'mail.mailers.smtp.username' => $settings['mail']['username'],
            'mail.mailers.smtp.password' => $settings['mail']['password'],
            'mail.from.address' => $settings['mail']['from_address'],
            'mail.from.name' => $settings['mail']['from_name'],
        ]);
    }

    /**
     * @return array{paystack: array{public_key: bool, secret_key: bool, webhook_secret: bool}, mail: array{username: bool, password: bool}}
     */
    public function configured(): array
    {
        $settings = $this->all();

        return [
            'paystack' => [
                'public_key' => filled($settings['paystack']['public_key']),
                'secret_key' => filled($settings['paystack']['secret_key']),
                'webhook_secret' => filled($settings['paystack']['webhook_secret']),
            ],
            'mail' => [
                'username' => filled($settings['mail']['username']),
                'password' => filled($settings['mail']['password']),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaults(): array
    {
        return [
            'paystack' => [
                'public_key' => config('services.paystack.public_key'),
                'secret_key' => config('services.paystack.secret_key'),
                'webhook_secret' => config('services.paystack.webhook_secret'),
                'payment_url' => config('services.paystack.payment_url', 'https://api.paystack.co'),
            ],
            'mail' => [
                'mailer' => config('mail.default', 'smtp'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'scheme' => config('mail.mailers.smtp.scheme'),
                'username' => config('mail.mailers.smtp.username'),
                'password' => config('mail.mailers.smtp.password'),
                'from_address' => config('mail.from.address', 'hello@example.com'),
                'from_name' => config('mail.from.name', config('app.name', 'Laravel')),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function stored(): array
    {
        try {
            if (! Schema::hasTable('platform_settings')) {
                return [];
            }

            $stored = PlatformSetting::query()
                ->where('key', self::SettingKey)
                ->first()
                ?->value;

            return is_array($stored) ? $stored : [];
        } catch (Throwable) {
            return [];
        }
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    private function changes(array $settings): array
    {
        $changes = [
            'paystack' => [
                'payment_url' => Arr::get($settings, 'paystack.payment_url'),
            ],
            'mail' => [
                'mailer' => Arr::get($settings, 'mail.mailer'),
                'host' => Arr::get($settings, 'mail.host'),
                'port' => Arr::get($settings, 'mail.port'),
                'scheme' => Arr::get($settings, 'mail.scheme'),
                'username' => Arr::get($settings, 'mail.username'),
                'from_address' => Arr::get($settings, 'mail.from_address'),
                'from_name' => Arr::get($settings, 'mail.from_name'),
            ],
        ];

        foreach ([
            'paystack.public_key',
            'paystack.secret_key',
            'paystack.webhook_secret',
            'mail.password',
        ] as $key) {
            $value = Arr::get($settings, $key);

            if (filled($value)) {
                Arr::set($changes, $key, $value);
            }
        }

        return $changes;
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    private function normalizeForStorage(array $settings): array
    {
        return $this->normalize($settings, false);
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array{paystack: array{public_key: string|null, secret_key: string|null, webhook_secret: string|null, payment_url: string}, mail: array{mailer: string, host: string|null, port: int|null, scheme: string|null, username: string|null, password: string|null, from_address: string, from_name: string}}
     */
    private function normalize(array $settings, bool $withDefaults = true): array
    {
        if ($withDefaults) {
            $settings = array_replace_recursive($this->defaults(), $settings);
        }

        return [
            'paystack' => [
                'public_key' => $this->nullableString(Arr::get($settings, 'paystack.public_key')),
                'secret_key' => $this->nullableString(Arr::get($settings, 'paystack.secret_key')),
                'webhook_secret' => $this->nullableString(Arr::get($settings, 'paystack.webhook_secret')),
                'payment_url' => $this->stringOrDefault(Arr::get($settings, 'paystack.payment_url'), 'https://api.paystack.co'),
            ],
            'mail' => [
                'mailer' => $this->stringOrDefault(Arr::get($settings, 'mail.mailer'), 'smtp'),
                'host' => $this->nullableString(Arr::get($settings, 'mail.host')),
                'port' => filled(Arr::get($settings, 'mail.port')) ? (int) Arr::get($settings, 'mail.port') : null,
                'scheme' => $this->nullableString(Arr::get($settings, 'mail.scheme')),
                'username' => $this->nullableString(Arr::get($settings, 'mail.username')),
                'password' => $this->nullableString(Arr::get($settings, 'mail.password')),
                'from_address' => $this->stringOrDefault(Arr::get($settings, 'mail.from_address'), 'hello@example.com'),
                'from_name' => $this->stringOrDefault(Arr::get($settings, 'mail.from_name'), (string) config('app.name', 'Laravel')),
            ],
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        return filled($value) ? trim((string) $value) : null;
    }

    private function stringOrDefault(mixed $value, string $default): string
    {
        return filled($value) ? trim((string) $value) : $default;
    }

    private function mailSchemeForConfig(?string $scheme): ?string
    {
        return match ($scheme) {
            'tls' => 'smtp',
            'ssl' => 'smtps',
            default => $scheme,
        };
    }
}
