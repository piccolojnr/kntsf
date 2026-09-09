<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SlugGenerator
{
    /**
     * @param  class-string<Model>|Builder<Model>  $modelOrQuery
     */
    public function generate(
        string $title,
        string|Builder $modelOrQuery,
        string $column = 'slug',
        ?int $ignoreId = null,
        string $ignoreColumn = 'id',
        int $maxLength = 80,
    ): string {
        $baseSlug = Str::slug($title);

        if ($baseSlug === '') {
            $baseSlug = 'item';
        }

        $baseSlug = Str::limit($baseSlug, $maxLength, '');
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->exists($modelOrQuery, $column, $slug, $ignoreId, $ignoreColumn)) {
            $reservedLength = mb_strlen((string) $suffix) + 1;
            $slug = Str::limit($baseSlug, max(1, $maxLength - $reservedLength), '').'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    /**
     * @param  class-string<Model>|Builder<Model>  $modelOrQuery
     */
    private function exists(
        string|Builder $modelOrQuery,
        string $column,
        string $slug,
        ?int $ignoreId,
        string $ignoreColumn,
    ): bool {
        $query = is_string($modelOrQuery)
            ? $modelOrQuery::query()
            : clone $modelOrQuery;

        return $query
            ->where($column, $slug)
            ->when($ignoreId !== null, fn (Builder $query) => $query->where($ignoreColumn, '!=', $ignoreId))
            ->exists();
    }
}
