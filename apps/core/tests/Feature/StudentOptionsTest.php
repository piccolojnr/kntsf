<?php

use App\Models\AppSetting;
use App\Support\StudentOptions;
use Database\Seeders\StudentOptionsSeeder;

test('student options seeder creates configurable defaults', function () {
    $this->seed(StudentOptionsSeeder::class);

    $this->assertDatabaseHas('app_settings', [
        'key' => StudentOptions::SettingKey,
    ]);

    $options = app(StudentOptions::class)->forFrontend();

    expect($options['student_number_prefix'])->toBe('2610')
        ->and($options['levels'])->toContain([
            'value' => '100',
            'label' => '100',
        ])
        ->and(collect($options['courses'])->pluck('value'))
        ->toContain('Computer Science');
});

test('student options can be customized from app settings', function () {
    AppSetting::query()->create([
        'key' => StudentOptions::SettingKey,
        'value' => [
            'student_number_prefix' => '2610',
            'courses' => ['Cybersecurity'],
            'levels' => ['100', '200'],
        ],
    ]);

    $options = app(StudentOptions::class);

    expect($options->courseValues())->toBe(['Cybersecurity'])
        ->and($options->levelValues())->toBe(['100', '200']);
});
