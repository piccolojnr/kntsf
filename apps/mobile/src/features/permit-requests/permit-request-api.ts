import { apiClient } from "@/lib/api/api-client";
import { toUserFacingError } from "@/lib/api/api-errors";
import { unwrapData, unwrapPaginated } from "@/lib/api/api-response";
import { PaginatedResult } from "@/lib/api/pagination";

import {
  CreatePermitRequestPayload,
  PaymentInitialization,
  PaymentInitializationDto,
  PermitRequest,
  PermitRequestOptions,
  VerifyPaymentPayload,
} from "./permit-request-types";

type PermitRequestListResponse =
  | PermitRequest[]
  | { permit_requests: PermitRequest[] }
  | { requests: PermitRequest[] };

function normalizePaymentInitialization(
  dto: PaymentInitializationDto,
  requestReference: string,
): PaymentInitialization {
  const nested = dto.payment ?? dto.paystack ?? dto.data ?? {};
  const authorizationUrl =
    dto.authorization_url ??
    dto.authorizationUrl ??
    dto.authorizationURL ??
    nested.authorization_url;
  const reference = dto.reference ?? nested.reference;
  const permitRequestReference =
    dto.permit_request_reference ??
    nested.permit_request_reference ??
    dto.request_reference ??
    dto.permit_request?.request_reference ??
    requestReference;

  if (!authorizationUrl) {
    throw new Error("The payment authorization link was not returned.");
  }

  if (!reference) {
    throw new Error("The payment reference was not returned.");
  }

  return {
    authorization_url: authorizationUrl,
    access_code: dto.access_code ?? nested.access_code,
    reference,
    permit_request_reference: permitRequestReference,
  };
}

type PermitRequestOptionsDto = Partial<PermitRequestOptions> & {
  default_amount?: string | number;
  amount?: string | number;
  permit_requests_enabled?: boolean;
  requests_enabled?: boolean;
  student?: PermitRequestOptions["student"];
  has_active_permit?: boolean;
  has_pending_request?: boolean;
  pending_request?: PermitRequest | null;
  missing_email?: boolean;
  missing_phone?: boolean;
  missing_contact?: {
    email?: boolean;
    phone?: boolean;
  } | null;
};

function normalizePermitRequestOptions(
  dto: PermitRequestOptionsDto,
): PermitRequestOptions {
  return {
    active_academic_period: dto.active_academic_period ?? null,
    default_amount: String(dto.default_amount ?? dto.amount ?? "0"),
    currency: dto.currency ?? "GHS",
    permit_requests_enabled:
      dto.permit_requests_enabled ?? dto.requests_enabled ?? false,
    student: dto.student ?? null,
    has_active_permit: Boolean(dto.has_active_permit),
    has_pending_request: Boolean(dto.has_pending_request ?? dto.pending_request),
    pending_request: dto.pending_request ?? null,
    missing_contact: {
      email: Boolean(dto.missing_contact?.email ?? dto.missing_email),
      phone: Boolean(dto.missing_contact?.phone ?? dto.missing_phone),
    },
  };
}

export async function getPermitRequestOptions() {
  try {
    const response = await apiClient.get<
      PermitRequestOptionsDto | { data: PermitRequestOptionsDto }
    >("/api/mobile/permit-requests/options");

    return normalizePermitRequestOptions(
      unwrapData<PermitRequestOptionsDto>(response.data),
    );
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

export async function initializePermitPayment(input: {
  callbackUrl?: string;
  reference: string;
}) {
  try {
    const response = await apiClient.post<
      PaymentInitializationDto | { data: PaymentInitializationDto }
    >(
      `/api/mobile/permit-requests/${encodeURIComponent(input.reference)}/initialize-payment`,
      input.callbackUrl
        ? {
            callback_url: input.callbackUrl,
            redirect_url: input.callbackUrl,
          }
        : {},
    );

    return normalizePaymentInitialization(
      unwrapData<PaymentInitializationDto>(response.data),
      input.reference,
    );
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
