<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VerificationResultResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'method' => $this->method->value,
            'result' => $this->result->value,
            'reason' => $this->reason,
            'student' => $this->student ? new StudentResource($this->student) : null,
            'permit' => $this->permit ? new PermitResource($this->permit->loadMissing('academicPeriod')) : null,
        ];
    }
}
