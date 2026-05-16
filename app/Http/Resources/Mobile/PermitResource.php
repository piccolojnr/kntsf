<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermitResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code_last4' => $this->code_last4,
            'status' => $this->status->value,
            'starts_at' => $this->starts_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'amount_paid' => (string) $this->amount_paid,
            'currency' => $this->currency,
            'card_delivered_at' => $this->card_delivered_at?->toISOString(),
            'revoked_at' => $this->revoked_at?->toISOString(),
            'revocation_reason' => $this->revocation_reason,
            'student' => new StudentResource($this->whenLoaded('student')),
            'academic_period' => $this->whenLoaded('academicPeriod', fn (): ?array => $this->academicPeriod ? [
                'id' => $this->academicPeriod->id,
                'name' => $this->academicPeriod->name,
                'academic_year' => $this->academicPeriod->academic_year,
                'semester' => $this->academicPeriod->semester,
                'is_active' => (bool) $this->academicPeriod->is_active,
            ] : null),
            'issued_by' => $this->whenLoaded('issuedBy', fn (): ?array => $this->issuedBy ? [
                'id' => $this->issuedBy->id,
                'name' => $this->issuedBy->name,
            ] : null),
        ];
    }
}
