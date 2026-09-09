<?php

namespace App\Console\Commands;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PermitRequestStatus;
use App\Models\PermitRequest;
use App\Support\ApplicationCache;
use App\Support\AuditEvents;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('permit-requests:expire')]
#[Description('Mark expired unpaid self-service permit requests as expired')]
class ExpirePermitRequestsCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(ApplicationCache $cache, CreateAuditLogAction $createAuditLog): int
    {
        $updated = 0;

        PermitRequest::query()
            ->with('student')
            ->where('status', PermitRequestStatus::AwaitingPayment)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->each(function (PermitRequest $permitRequest) use (&$updated, $createAuditLog): void {
                $oldValues = $permitRequest->only(['status']);

                $permitRequest->forceFill([
                    'status' => PermitRequestStatus::Expired,
                ])->save();

                $createAuditLog->handle(
                    actor: null,
                    event: AuditEvents::PermitRequestExpired,
                    auditable: $permitRequest,
                    subject: $permitRequest->student,
                    description: 'Expired unpaid permit request automatically.',
                    metadata: ['request_reference' => $permitRequest->request_reference],
                    oldValues: $oldValues,
                    newValues: $permitRequest->only(['status']),
                );

                $updated++;
            });

        if ($updated > 0) {
            $cache->flushDashboard();
        }

        $this->info("Expired {$updated} permit request(s).");

        return self::SUCCESS;
    }
}
