<?php

use App\Models\AppSetting;
use App\Support\ContentSettings;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $setting = AppSetting::query()->firstOrNew([
            'key' => ContentSettings::SettingKey,
        ]);

        $setting->value = [
            ...app(ContentSettings::class)->defaults(),
            ...(is_array($setting->value) ? $setting->value : []),
            'allow_public_documents' => true,
        ];

        $setting->save();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $setting = AppSetting::query()
            ->where('key', ContentSettings::SettingKey)
            ->first();

        if ($setting === null) {
            return;
        }

        $setting->value = [
            ...(is_array($setting->value) ? $setting->value : []),
            'allow_public_documents' => false,
        ];

        $setting->save();
    }
};
