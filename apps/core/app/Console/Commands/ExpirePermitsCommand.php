<?php

namespace App\Console\Commands;

use App\Enums\PermitStatus;
use App\Models\Permit;
use App\Support\ApplicationCache;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('permits:expire')]
#[Description('Mark active permits as expired after their expiry date')]
class ExpirePermitsCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(ApplicationCache $cache): int
    {
        $updated = Permit::query()
            ->where('status', PermitStatus::Active)
            ->where('expires_at', '<', now())
            ->update(['status' => PermitStatus::Expired]);

        if ($updated > 0) {
            $cache->flushDashboard();
        }

        $this->info("Expired {$updated} permit(s).");

        return self::SUCCESS;
    }
}
