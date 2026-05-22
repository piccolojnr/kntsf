import {
  normalizeLaravelPagination,
  PaginatedResult,
} from "@/lib/api/pagination";

type LaravelResourceResponse<T> = {
  data: T;
};

type OldMobileResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type LaravelPaginatedResponse<T> = {
  data: T[];
  links?: Record<string, string | null>;
  meta?: Record<string, unknown>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isOldMobileResponse<T>(response: unknown): response is OldMobileResponse<T> {
  return isObject(response) && "success" in response;
}

export function unwrapData<T>(response: T | LaravelResourceResponse<T> | OldMobileResponse<T>): T {
  if (isOldMobileResponse<T>(response)) {
    if (response.success === false) {
      throw new Error(response.message ?? "The request could not be completed.");
    }

    return response.data as T;
  }

  if (isObject(response) && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

export function unwrapPaginated<T>(
  response: LaravelPaginatedResponse<T> | OldMobileResponse<PaginatedResult<T>>,
): PaginatedResult<T> {
  if (isOldMobileResponse<PaginatedResult<T>>(response)) {
    if (response.success === false) {
      throw new Error(response.message ?? "The request could not be completed.");
    }

    return response.data as PaginatedResult<T>;
  }

  return normalizeLaravelPagination({
    data: response.data,
    links: response.links,
    meta: response.meta,
  });
}
