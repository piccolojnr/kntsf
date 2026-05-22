<?php

namespace App\Support;

use App\Models\AppSetting;
use Illuminate\Support\Collection;

class StudentOptions
{
    public const SettingKey = 'students.options';

    /**
     * @return array{student_number_prefix: string, courses: list<array{value: string, label: string}>, levels: list<array{value: string, label: string}>}
     */
    public function forFrontend(): array
    {
        return [
            'student_number_prefix' => $this->studentNumberPrefix(),
            'courses' => $this->courses(),
            'levels' => $this->levels(),
        ];
    }

    public function studentNumberPrefix(): string
    {
        return (string) ($this->settings()['student_number_prefix'] ?? '2610');
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public function courses(): array
    {
        return $this->optionList($this->settings()['courses'] ?? []);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public function levels(): array
    {
        return $this->optionList($this->settings()['levels'] ?? []);
    }

    /**
     * @return list<string>
     */
    public function courseValues(): array
    {
        return collect($this->courses())->pluck('value')->all();
    }

    /**
     * @return list<string>
     */
    public function levelValues(): array
    {
        return collect($this->levels())->pluck('value')->all();
    }

    /**
     * @return array{student_number_prefix?: string, courses?: mixed, levels?: mixed}
     */
    private function settings(): array
    {
        $defaults = config('student-options', []);
        $stored = AppSetting::query()
            ->where('key', self::SettingKey)
            ->first()
            ?->value;

        if (! is_array($stored)) {
            return $defaults;
        }

        return array_replace($defaults, $stored);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function optionList(mixed $items): array
    {
        return collect(is_array($items) ? $items : [])
            ->map(function (mixed $item): ?array {
                if (is_array($item)) {
                    $value = $item['value'] ?? null;
                    $label = $item['label'] ?? $value;
                } else {
                    $value = $item;
                    $label = $item;
                }

                if (! is_string($value) || trim($value) === '') {
                    return null;
                }

                return [
                    'value' => trim($value),
                    'label' => is_string($label) && trim($label) !== '' ? trim($label) : trim($value),
                ];
            })
            ->filter()
            ->values()
            ->pipe(fn (Collection $options): array => $options->all());
    }
}
