<?php

namespace App\Support;

use App\Enums\PublishStatus;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class Publishing
{
    public function isPublished(PublishStatus|string|null $status, DateTimeInterface|string|null $publishedAt = null): bool
    {
        $status = $this->statusValue($status);

        if ($status !== PublishStatus::Published->value) {
            return false;
        }

        return $publishedAt === null || $this->date($publishedAt)->lte(now());
    }

    public function isScheduled(PublishStatus|string|null $status, DateTimeInterface|string|null $publishedAt = null): bool
    {
        $status = $this->statusValue($status);

        return $status === PublishStatus::Scheduled->value
            || ($status === PublishStatus::Published->value && $publishedAt !== null && $this->date($publishedAt)->isFuture());
    }

    public function isDraft(PublishStatus|string|null $status): bool
    {
        return $this->statusValue($status) === PublishStatus::Draft->value;
    }

    public function isArchived(PublishStatus|string|null $status): bool
    {
        return $this->statusValue($status) === PublishStatus::Archived->value;
    }

    /**
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public function publishedScope(
        Builder $query,
        string $statusColumn = 'publish_status',
        string $publishedAtColumn = 'published_at'
    ): Builder {
        return $query
            ->where($statusColumn, PublishStatus::Published->value)
            ->where(function (Builder $query) use ($publishedAtColumn): void {
                $query->whereNull($publishedAtColumn)
                    ->orWhere($publishedAtColumn, '<=', now());
            });
    }

    private function statusValue(PublishStatus|string|null $status): ?string
    {
        return $status instanceof PublishStatus ? $status->value : $status;
    }

    private function date(DateTimeInterface|string $value): Carbon
    {
        return $value instanceof DateTimeInterface
            ? Carbon::instance($value)
            : Carbon::parse($value);
    }
}
