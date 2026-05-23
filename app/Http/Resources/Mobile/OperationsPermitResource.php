<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperationsPermitResource extends JsonResource
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
            'status' => $this->status->value,
            'code_last4' => $this->code_last4,
            'student' => $this->whenLoaded('student', fn (): ?array => $this->student ? [
                'id' => $this->student->id,
                'student_number' => $this->student->student_number,
                'name' => $this->student->name,
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
            'starts_at' => $this->starts_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'amount_paid' => (string) $this->amount_paid,
            'currency' => $this->currency,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
