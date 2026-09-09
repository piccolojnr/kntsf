<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperationsNfcCardResource extends JsonResource
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
            'uid_last4' => $this->uid_last4,
            'student' => $this->whenLoaded('student', fn (): ?array => $this->student ? [
                'id' => $this->student->id,
                'student_number' => $this->student->student_number,
                'name' => $this->student->name,
                'course' => $this->student->course,
                'level' => $this->student->level,
            ] : null),
            'issued_at' => $this->issued_at?->toISOString(),
            'activated_at' => $this->activated_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
