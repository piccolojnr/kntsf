<?php

namespace App\Support;

use App\Models\AppSetting;

class PermitSettings
{
    public const SettingKey = 'permits.settings';

    /**
     * @return array{default_amount: float, currency: string, default_validity_days: int, permit_requests_enabled: bool}
     */
    public function all(): array
    {
        $stored = AppSetting::query()
            ->where('key', self::SettingKey)
            ->value('value');

        return $this->normalize(is_array($stored) ? $stored : []);
    }

    /**
     * @param  array{default_amount?: mixed, currency?: mixed, default_validity_days?: mixed, permit_requests_enabled?: mixed}  $settings
     * @return array{default_amount: float, currency: string, default_validity_days: int, permit_requests_enabled: bool}
     */
    public function update(array $settings): array
    {
        $normalized = $this->normalize($settings);

        AppSetting::query()->updateOrCreate([
            'key' => self::SettingKey,
        ], [
            'value' => $normalized,
        ]);

        return $normalized;
    }

    /**
     * @return array{default_amount: float, currency: string, default_validity_days: int, permit_requests_enabled: bool}
     */
    public function defaults(): array
    {
        return [
            'default_amount' => 0.0,
            'currency' => 'GHS',
            'default_validity_days' => 120,
            'permit_requests_enabled' => false,
        ];
    }

    /**
     * @param  array{default_amount?: mixed, currency?: mixed, default_validity_days?: mixed, permit_requests_enabled?: mixed}  $settings
     * @return array{default_amount: float, currency: string, default_validity_days: int, permit_requests_enabled: bool}
     */
    private function normalize(array $settings): array
    {
        $settings = array_replace($this->defaults(), $settings);

        return [
            'default_amount' => (float) $settings['default_amount'],
            'currency' => mb_strtoupper((string) $settings['currency']),
            'default_validity_days' => (int) $settings['default_validity_days'],
            'permit_requests_enabled' => (bool) $settings['permit_requests_enabled'],
        ];
    }
}
