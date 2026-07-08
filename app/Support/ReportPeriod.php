<?php

namespace App\Support;

use App\Models\AcademicPeriod;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

final class ReportPeriod
{
    public function __construct(
        public readonly string $preset = 'all',
        public readonly ?CarbonImmutable $startsAt = null,
        public readonly ?CarbonImmutable $endsAt = null,
        public readonly ?int $year = null,
        public readonly ?int $academicPeriodId = null,
        public readonly string $label = 'All records',
    ) {}

    public static function all(): self
    {
        return new self;
    }

    public static function fromRequest(Request $request, string $defaultPreset = 'current_month'): self
    {
        $preset = (string) $request->query('period', $defaultPreset);

        return match ($preset) {
            'custom' => self::custom(
                $request->date('start_date')?->toImmutable(),
                $request->date('end_date')?->toImmutable(),
            ),
            'year' => self::year((int) ($request->query('year') ?: now()->year)),
            'academic_period' => self::academicPeriod((int) $request->query('academic_period_id')),
            'current_year' => self::year((int) now()->year, 'current_year'),
            'all' => self::all(),
            default => self::currentMonth(),
        };
    }

    public static function currentMonth(): self
    {
        $now = CarbonImmutable::now();

        return new self(
            preset: 'current_month',
            startsAt: $now->startOfMonth(),
            endsAt: $now->endOfMonth(),
            label: $now->format('F Y'),
        );
    }

    public static function year(int $year, string $preset = 'year'): self
    {
        $year = $year > 1900 ? $year : now()->year;
        $startsAt = CarbonImmutable::create($year, 1, 1)->startOfDay();
        $endsAt = CarbonImmutable::create($year, 12, 31)->endOfDay();

        return new self(
            preset: $preset,
            startsAt: $startsAt,
            endsAt: $endsAt,
            year: $year,
            label: (string) $year,
        );
    }

    public static function custom(?CarbonImmutable $startsAt, ?CarbonImmutable $endsAt): self
    {
        $startsAt ??= CarbonImmutable::now()->startOfMonth();
        $endsAt ??= CarbonImmutable::now()->endOfDay();

        if ($startsAt->greaterThan($endsAt)) {
            [$startsAt, $endsAt] = [$endsAt, $startsAt];
        }

        return new self(
            preset: 'custom',
            startsAt: $startsAt->startOfDay(),
            endsAt: $endsAt->endOfDay(),
            label: $startsAt->format('M j, Y').' - '.$endsAt->format('M j, Y'),
        );
    }

    public static function academicPeriod(int $academicPeriodId): self
    {
        $period = AcademicPeriod::query()->find($academicPeriodId)
            ?? AcademicPeriod::query()->where('is_active', true)->first();

        if (! $period instanceof AcademicPeriod) {
            return self::currentMonth();
        }

        return new self(
            preset: 'academic_period',
            startsAt: $period->starts_at?->toImmutable()?->startOfDay(),
            endsAt: $period->ends_at?->toImmutable()?->endOfDay(),
            academicPeriodId: $period->id,
            label: $period->name,
        );
    }

    public function cacheKey(): string
    {
        return implode(':', [
            $this->preset,
            $this->startsAt?->toDateString() ?? 'start',
            $this->endsAt?->toDateString() ?? 'end',
            $this->year ?? 'year',
            $this->academicPeriodId ?? 'period',
        ]);
    }

    /**
     * @return array{preset: string, start_date: string|null, end_date: string|null, year: int|null, academic_period_id: int|null, label: string}
     */
    public function toArray(): array
    {
        return [
            'preset' => $this->preset,
            'start_date' => $this->startsAt?->toDateString(),
            'end_date' => $this->endsAt?->toDateString(),
            'year' => $this->year,
            'academic_period_id' => $this->academicPeriodId,
            'label' => $this->label,
        ];
    }
}
