<?php

namespace Database\Seeders;

use App\Support\PermitSettings;
use Illuminate\Database\Seeder;

class PermitSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permitSettings = app(PermitSettings::class);

        $permitSettings->update($permitSettings->defaults());
    }
}
