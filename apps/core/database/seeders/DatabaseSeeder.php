<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            StudentOptionsSeeder::class,
            PermitSettingsSeeder::class,
            ContentSettingsSeeder::class,
        ]);

        User::query()->firstOrCreate([
            'email' => 'registry@kntsf.edu.gh',
        ], [
            'name' => 'Campus Registry',
            'password' => 'password',
            'is_active' => true,
        ]);

        if ($this->shouldSeedDevelopmentData()) {
            $this->call(DevelopmentSeeder::class);
        }
    }

    private function shouldSeedDevelopmentData(): bool
    {
        return app()->environment(['local', 'development', 'staging'])
            && (bool) env('SEED_DEVELOPMENT_DATA', false);
    }
}
