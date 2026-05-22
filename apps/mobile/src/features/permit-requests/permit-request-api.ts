import { apiClient } from "@/lib/api/api-client";
import { toUserFacingError } from "@/lib/api/api-errors";
import { unwrapData, unwrapPaginated } from "@/lib/api/api-response";
import { PaginatedResult } from "@/lib/api/pagination";

import {
  CreatePermitRequestPayload,
  PaymentInitialization,
  PermitRequest,
  PermitRequestOptions,
  VerifyPaymentPayload,
} from "./permit-request-types";

type PermitRequestListResponse =
  | PermitRequest[]
  | { permit_requests: PermitRequest[] }
  | { requests: PermitRequest[] };

export async function getPermitRequestOptions() {
  try {
    const response = await apiClient.get<
      PermitRequestOptions | { data: PermitRequestOptions }
    >("/api/mobile/permit-requests/options");

    return unwrapData<PermitRequestOptions>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getPermitRequests(): Promise<PermitRequest[]> {
  try {
    const response = await apiClient.get<
      | PermitRequestListResponse
      | { data: PermitRequest[]; links?: Record<string, string | null>; meta?: Record<string, unknown> }
      | { data: PermitRequestListResponse }
    >("/api/mobile/permit-requests");

    if (
      response.data &&
      typeof response.data === "object" &&
      "meta" in response.data &&
      Array.isArray(response.data.data)
    ) {
      return unwrapPaginated<PermitRequest>(
        response.data as {
          data: PermitRequest[];
          links?: Record<string, string | null>;
          meta?: Record<string, unknown>;
        },
      ).items;
    }

    const data = unwrapData<PermitRequestListResponse>(response.data);

    if (Array.isArray(data)) {
      return data;
    }

    if ("permit_requests" in data) {
      return data.permit_requests;
    }

    return data.requests;
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getPermitRequestsPage(): Promise<
  PaginatedResult<PermitRequest>
> {
  try {
    const response = await apiClient.get<{
      data: PermitRequest[];
      links?: Record<string, string | null>;
      meta?: Record<string, unknown>;
    }>("/api/mobile/permit-requests");

    return unwrapPaginated<PermitRequest>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function createPermitRequest(payload?: CreatePermitRequestPayload) {
  try {
    const response = await apiClient.post<
      PermitRequest | { data: PermitRequest }
    >("/api/mobile/permit-requests", payload ?? {});

    return unwrapData<PermitRequest>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getPermitRequest(reference: string) {
  try {
    const response = await apiClient.get<PermitRequest | { data: PermitRequest }>(
      `/api/mobile/permit-requests/${encodeURIComponent(reference)}`,
    );

    return unwrapData<PermitRequest>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function initializePermitPayment(reference: string) {
  try {
    const response = await apiClient.post<
      PaymentInitialization | { data: PaymentInitialization }
    >(
      `/api/mobile/permit-requests/${encodeURIComponent(reference)}/initialize-payment`,
    );

    return unwrapData<PaymentInitialization>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function verifyPermitPayment(
  reference: string,
  payload?: VerifyPaymentPayload,
) {
  try {
    const response = await apiClient.post<
      PermitRequest | { data: PermitRequest }
    >(
      `/api/mobile/permit-requests/${encodeURIComponent(reference)}/verify-payment`,
      payload ?? {},
    );

    return unwrapData<PermitRequest>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}
