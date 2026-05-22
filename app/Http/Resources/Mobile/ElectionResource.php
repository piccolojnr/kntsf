<?php

namespace App\Http\Resources\Mobile;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $student = $request->user()?->student;

        return [
            'id' => $this->id,
            'academic_period_id' => $this->academic_period_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'status' => $this->status->value,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'results_visible' => (bool) $this->results_visible,
            'positions_count' => $this->whenCounted('positions'),
            'has_voted' => $student instanceof Student
                ? $this->votes->where('student_id', $student->id)->isNotEmpty()
                : false,
            'academic_period' => $this->whenLoaded('academicPeriod', fn (): ?array => $this->academicPeriod ? [
                'id' => $this->academicPeriod->id,
                'name' => $this->academicPeriod->name,
                'academic_year' => $this->academicPeriod->academic_year,
                'semester' => $this->academicPeriod->semester,
            ] : null),
            'eligibility' => $this->when(isset($this->eligibility), fn (): array => $this->eligibility),
            'positions' => ElectionPositionResource::collection($this->whenLoaded('positions')),
        ];
    }
}
