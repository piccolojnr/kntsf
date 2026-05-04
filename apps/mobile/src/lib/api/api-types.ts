import { AxiosRequestConfig } from "axios";

export type ApiSuccess<T> = {
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
};

export type AuthenticatedRequestConfig = AxiosRequestConfig & {
  requiresAuth?: boolean;
};
