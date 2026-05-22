<?php

namespace App\Support;

use App\Enums\PaymentStatus;
use App\Enums\PermitRequestStatus;
use App\Models\PermitRequest;
use Illuminate\Database\Eloquent\Builder;

class PermitRequestRecovery
{
    public function paidNotIssued(): Builder
    {
        return PermitRequest::query()
            ->where('status', PermitRequestStatus::Paid);
    }

    public function awaitingPaymentExpired(): Builder
    {
        return PermitRequest::query()
            ->where('status', PermitRequestStatus::AwaitingPayment)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now());
    }

    public function paymentSuccessRequestFailed(): Builder
    {
        return PermitRequest::query()
            ->where('status', PermitRequestStatus::Failed)
            ->whereHas('payment', fn (Builder $query) => $query->where('status', PaymentStatus::Success));
    }

    public function paymentWithoutPermit(): Builder
    {
        return PermitRequest::query()
            ->whereHas('payment', fn (Builder $query) => $query
                ->where('status', PaymentStatus::Success)
                ->whereNull('permit_id'))
            ->whereNot('status', PermitRequestStatus::Issued);
    }

    /**
     * @return array<string, int>
     */
    public function counts(): array
    {
        return [
            'paid_not_issued' => $this->paidNotIssued()->count(),
            'awaiting_payment_expired' => $this->awaitingPaymentExpired()->count(),
            'payment_success_request_failed' => $this->paymentSuccessRequestFailed()->count(),
            'payment_without_permit' => $this->paymentWithoutPermit()->count(),
        ];
    }
}
