import { AxiosRequestConfig } from "axios";

import { PaginatedResult } from "@/lib/api/pagination";

export type ApiSuccess<T> = {
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};

export type ApiListResponse<T> = {
  items: T[];
  pagination: ApiPagination;
};

export type LaravelPaginatedResult<T> = PaginatedResult<T>;

export type AuthenticatedRequestConfig = AxiosRequestConfig & {
  requiresAuth?: boolean;
};
