<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperationsVerificationLogResource extends JsonResource
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
            'method' => $this->method->value,
            'result' => $this->result->value,
            'reason' => $this->reason,
            'student' => $this->whenLoaded('student', fn (): ?array => $this->student ? [
                'id' => $this->student->id,
                'student_number' => $this->student->student_number,
                'name' => $this->student->name,
            ] : null),
            'permit' => $this->whenLoaded('permit', fn (): ?array => $this->permit ? [
                'id' => $this->permit->id,
                'status' => $this->permit->status->value,
                'code_last4' => $this->permit->code_last4,
            ] : null),
            'verifier' => $this->whenLoaded('verifier', fn (): ?array => $this->verifier ? [
                'id' => $this->verifier->id,
                'name' => $this->verifier->name,
            ] : null),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
