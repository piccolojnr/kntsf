import { AxiosRequestConfig } from "axios";

export type ApiSuccess<T> = {
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
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

export type AuthenticatedRequestConfig = AxiosRequestConfig & {
  requiresAuth?: boolean;
};
