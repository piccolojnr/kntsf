<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermitRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'request_reference' => $this->request_reference,
            'status' => $this->status->value,
            'amount' => (string) $this->amount,
            'currency' => $this->currency,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'review_status' => $this->review_status?->value,
            'requires_review' => $this->requires_review,
            'expires_at' => $this->expires_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'student' => $this->whenLoaded('student', fn (): ?array => $this->student ? [
                'id' => $this->student->id,
                'student_number' => $this->student->student_number,
                'name' => $this->student->name,
                'email' => $this->student->email,
                'phone' => $this->student->phone,
                'course' => $this->student->course,
                'level' => $this->student->level,
            ] : null),
            'academic_period' => $this->whenLoaded('academicPeriod', fn (): ?array => $this->academicPeriod ? [
                'id' => $this->academicPeriod->id,
                'name' => $this->academicPeriod->name,
                'academic_year' => $this->academicPeriod->academic_year,
                'semester' => $this->academicPeriod->semester,
                'is_active' => (bool) $this->academicPeriod->is_active,
            ] : null),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'permit' => $this->whenLoaded('payment', fn (): ?PermitResource => $this->payment?->permit
                ? new PermitResource($this->payment->permit->loadMissing(['academicPeriod']))
                : null),
        ];
    }
}
