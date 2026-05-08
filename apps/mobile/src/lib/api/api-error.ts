import { isAxiosError } from "axios";

import { ApiErrorResponse } from "./api-types";

export type NormalizedApiError = {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
};

export type UserFacingApiError = Error & {
  statusCode?: number;
  isNetworkError?: boolean;
};

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const maybeError = data as Partial<ApiErrorResponse> & {
    error?: string | { message?: unknown };
  };

  if (typeof maybeError.message === "string") {
    return maybeError.message;
  }

  if (typeof maybeError.error === "string") {
    return maybeError.error;
  }

  if (
    maybeError.error &&
    typeof maybeError.error === "object" &&
    typeof maybeError.error.message === "string"
  ) {
    return maybeError.error.message;
  }

  return null;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseMessage = getErrorMessage(error.response?.data);

    return {
      message:
        responseMessage ??
        (error.response ? DEFAULT_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE),
      statusCode,
      isNetworkError: !error.response,
    };
  }

  if (error instanceof Error) {
    const maybeApiError = error as UserFacingApiError;

    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
      statusCode: maybeApiError.statusCode,
      isNetworkError: Boolean(maybeApiError.isNetworkError),
    };
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const maybeApiError = error as Partial<UserFacingApiError>;

    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
      statusCode: maybeApiError.statusCode,
      isNetworkError: Boolean(maybeApiError.isNetworkError),
    };
  }

  return {
    message: DEFAULT_ERROR_MESSAGE,
    isNetworkError: false,
  };
}

export function toUserFacingError(error: unknown) {
  const normalizedError = normalizeApiError(error);
  const userFacingError = new Error(
    normalizedError.message,
  ) as UserFacingApiError;

  userFacingError.statusCode = normalizedError.statusCode;
  userFacingError.isNetworkError = normalizedError.isNetworkError;

  return userFacingError;
}
