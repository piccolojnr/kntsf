export type LaravelPaginationLinks = {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
};

export type LaravelPaginationMeta = {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  per_page?: number;
  to?: number | null;
  total?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    from?: number | null;
    to?: number | null;
  };
  links?: LaravelPaginationLinks;
  meta?: LaravelPaginationMeta;
};

export function normalizeLaravelPagination<T>(response: {
  data: T[];
  links?: LaravelPaginationLinks;
  meta?: LaravelPaginationMeta;
}): PaginatedResult<T> {
  const meta = response.meta ?? {};

  return {
    items: response.data,
    pagination: {
      page: meta.current_page ?? 1,
      limit: meta.per_page ?? response.data.length,
      total: meta.total ?? response.data.length,
      totalPages: meta.last_page,
      from: meta.from,
      to: meta.to,
    },
    links: response.links,
    meta,
  };
}
