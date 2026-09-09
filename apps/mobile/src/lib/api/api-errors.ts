import { isAxiosError } from "axios";

export type ApiError = {
  status?: number;
  statusCode?: number;
  message: string;
  fields?: Record<string, string[]>;
  isNetworkError?: boolean;
};

export type UserFacingApiError = Error & ApiError;

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";

type LaravelErrorBody = {
  message?: unknown;
  errors?: unknown;
  error?: unknown;
};

function normalizeFieldErrors(fields: unknown): Record<string, string[]> | undefined {
  if (!fields || typeof fields !== "object") {
    return undefined;
  }

  const normalizedFields: Record<string, string[]> = {};

  Object.entries(fields as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const messages = value.filter((item): item is string => typeof item === "string");

      if (messages.length > 0) {
        normalizedFields[key] = messages;
      }

      return;
    }

    if (typeof value === "string") {
      normalizedFields[key] = [value];
    }
  });

  return Object.keys(normalizedFields).length > 0 ? normalizedFields : undefined;
}

function getResponseMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const body = data as LaravelErrorBody;

  if (typeof body.message === "string") {
    return body.message;
  }

  if (typeof body.error === "string") {
    return body.error;
  }

  if (
    body.error &&
    typeof body.error === "object" &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }

  return null;
}

function getFallbackMessage(status?: number, hasResponse = false) {
  if (!hasResponse) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 422) {
    return "The given data was invalid.";
  }

  return DEFAULT_ERROR_MESSAGE;
}

export function normalizeApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const fields =
      status === 422 && responseData && typeof responseData === "object"
        ? normalizeFieldErrors((responseData as LaravelErrorBody).errors)
        : undefined;
    const message =
      getResponseMessage(responseData) ??
      getFallbackMessage(status, Boolean(error.response));

    return {
      status,
      statusCode: status,
      message,
      fields,
      isNetworkError: !error.response,
    };
  }

  if (error instanceof Error) {
    const maybeApiError = error as UserFacingApiError;
    const status = maybeApiError.status ?? maybeApiError.statusCode;

    return {
      status,
      statusCode: status,
      message: error.message || DEFAULT_ERROR_MESSAGE,
      fields: maybeApiError.fields,
      isNetworkError: Boolean(maybeApiError.isNetworkError),
    };
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const maybeApiError = error as Partial<ApiError> & { message: string };
    const status = maybeApiError.status ?? maybeApiError.statusCode;

    return {
      status,
      statusCode: status,
      message: maybeApiError.message || DEFAULT_ERROR_MESSAGE,
      fields: maybeApiError.fields,
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

  userFacingError.status = normalizedError.status;
  userFacingError.statusCode = normalizedError.status;
  userFacingError.fields = normalizedError.fields;
  userFacingError.isNetworkError = normalizedError.isNetworkError;

  return userFacingError;
}
