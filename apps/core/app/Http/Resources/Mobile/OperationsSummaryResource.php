<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperationsSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_students' => (int) $this->resource['total_students'],
            'active_permits' => (int) $this->resource['active_permits'],
            'active_nfc_cards' => (int) $this->resource['active_nfc_cards'],
            'verifications_today' => (int) $this->resource['verifications_today'],
            'failed_verifications_today' => (int) $this->resource['failed_verifications_today'],
            'pending_permit_requests' => (int) $this->resource['pending_permit_requests'],
            'paid_not_issued_requests' => (int) $this->resource['paid_not_issued_requests'],
        ];
    }
}
