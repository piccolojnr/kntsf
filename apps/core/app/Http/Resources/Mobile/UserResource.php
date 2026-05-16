<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'is_active' => (bool) $this->is_active,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'roles' => $this->getRoleNames()->values(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values(),
            'student' => new StudentResource($this->whenLoaded('student')),
            'executive_profile' => $this->whenLoaded('executiveProfile', fn (): ?array => $this->executiveProfile ? [
                'id' => $this->executiveProfile->id,
                'position' => $this->executiveProfile->position,
                'category' => $this->executiveProfile->category,
                'is_published' => (bool) $this->executiveProfile->is_published,
            ] : null),
        ];
    }
}
