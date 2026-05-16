<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
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
            'student_number' => $this->student_number,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'course' => $this->course,
            'level' => $this->level,
            'account_status' => [
                'activated' => $this->user_id !== null,
                'pending_setup' => $this->whenLoaded('user', fn (): bool => $this->user?->password === null, false),
            ],
            'user' => $this->whenLoaded('user', fn (): ?array => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'is_active' => (bool) $this->user->is_active,
            ] : null),
            'permits' => PermitResource::collection($this->whenLoaded('permits')),
            'active_nfc_card' => new NfcCardResource($this->whenLoaded('activeNfcCard')),
        ];
    }
}
