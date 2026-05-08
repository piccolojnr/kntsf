import { isAxiosError } from "axios";

import { ApiErrorResponse } from "./api-types";

export type NormalizedApiError = {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
};

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const maybeError = data as Partial<ApiErrorResponse> & {
    error?: string;
  };

  return maybeError.message ?? maybeError.error ?? null;
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
    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
      isNetworkError: false,
    };
  }

  return {
    message: DEFAULT_ERROR_MESSAGE,
    isNetworkError: false,
  };
}

export function toUserFacingError(error: unknown) {
  return new Error(normalizeApiError(error).message);
}
