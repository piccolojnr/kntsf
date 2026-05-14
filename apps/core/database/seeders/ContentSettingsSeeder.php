<?php

namespace Database\Seeders;

use App\Support\ContentSettings;
use Illuminate\Database\Seeder;

class ContentSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contentSettings = app(ContentSettings::class);

        $contentSettings->update($contentSettings->all());
    }
}
