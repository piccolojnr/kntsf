<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use App\Support\StudentOptions;
use Illuminate\Database\Seeder;

class StudentOptionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AppSetting::query()->updateOrCreate([
            'key' => StudentOptions::SettingKey,
        ], [
            'value' => config('student-options'),
        ]);
    }
}
