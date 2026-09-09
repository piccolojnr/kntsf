<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * NFC cards are soft deleted. A UID may be assigned again once its prior
     * assignment has been deleted, while retaining that prior record for audit
     * purposes.
     */
    public function up(): void
    {
        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->dropUnique(['uid_hash']);
            $table->unique(['uid_hash', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->dropUnique(['uid_hash', 'deleted_at']);
            $table->unique('uid_hash');
        });
    }
};
