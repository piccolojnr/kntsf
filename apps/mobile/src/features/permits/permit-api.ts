import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { unwrapData, unwrapPaginated } from "@/lib/api/api-response";
import { ApiListResponse } from "@/lib/api/api-types";

import {
  Permit,
  PermitDto,
  PermitIssuanceConfig,
  PermitIssuanceConfigDto,
} from "./permit-types";

type MobileApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type OperationsPermitListParams = {
  search?: string;
  status?: Permit["status"] | "all";
  academicPeriodId?: string | number;
  academic_period_id?: string | number;
  page?: number;
  limit?: number;
  per_page?: number;
};

export type PermitsListResult = ApiListResponse<Permit>;

export function normalizePermit(dto: PermitDto): Permit {
  const expiryDate =
    dto.expiryDate ?? dto.expires_at ?? dto.expiry_date ?? dto.expiresAt ?? "";
  const codeLast4 = dto.codeLast4 ?? dto.code_last4 ?? null;

  return {
    id: String(dto.id),
    studentId:
      dto.studentId ?? dto.student_id ?? dto.student?.id?.toString() ?? "",
    permitCode:
      (codeLast4 ? `.... ${codeLast4}` : undefined) ??
      dto.permitCode ??
      dto.permit_code ??
      dto.originalCode ??
      dto.code ??
      "",
    status: normalizePermitStatus(dto.status, expiryDate),
    startDate: dto.startDate ?? dto.starts_at ?? dto.start_date ?? "",
    expiryDate,
    amountPaid: Number(dto.amountPaid ?? dto.amount_paid ?? dto.amount ?? 0),
    currency: dto.currency ?? "GHS",
    codeLast4,
    academicPeriod: dto.academicPeriod ?? dto.academic_period ?? null,
    qrCode: dto.qrCode,
    student: dto.student ?? null,
  };
}

function normalizePermitStatus(
  status: PermitDto["status"],
  expiryDate: string,
): Permit["status"] {
  const currentStatus = status ?? "expired";
  const expiryTime = new Date(expiryDate).getTime();

  if (
    currentStatus === "active" &&
    Number.isFinite(expiryTime) &&
    expiryTime <= Date.now()
  ) {
    return "expired";
  }

  return currentStatus;
}

function normalizePermitIssuanceConfig(
  dto: PermitIssuanceConfigDto,
): PermitIssuanceConfig {
  return {
    enabled: dto.enabled ?? dto.issuanceEnabled ?? false,
    defaultAmount: dto.defaultAmount ?? dto.amount ?? 0,
    currency: dto.currency,
    expiryDate: dto.expiryDate ?? dto.expiry_date ?? dto.expiresAt ?? "",
    academicYear: dto.academicYear ?? dto.academic_year ?? null,
    semester: dto.semester ?? null,
  };
}

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

export async function getPermits(params?: OperationsPermitListParams) {
  try {
    const response = await apiClient.get<
      | MobileApiResponse<ApiListResponse<PermitDto>>
      | { data: PermitDto[]; links?: Record<string, string | null>; meta?: Record<string, unknown> }
      | PermitDto[]
    >("/api/mobile/operations/permits", {
      params: {
        search: params?.search,
        status: params?.status === "all" ? undefined : params?.status,
        academic_period_id: params?.academic_period_id ?? params?.academicPeriodId,
        page: params?.page,
        per_page: params?.per_page ?? params?.limit,
      },
    });

    if (Array.isArray(response.data)) {
      return response.data.map(normalizePermit);
    }

    if ("meta" in response.data && Array.isArray(response.data.data)) {
      return unwrapPaginated<PermitDto>(response.data).items.map(normalizePermit);
    }

    const data = getMobileData(response.data as MobileApiResponse<ApiListResponse<PermitDto>>);

    return data.items.map(normalizePermit);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getPermitsPage(
  params?: OperationsPermitListParams,
): Promise<PermitsListResult> {
  try {
    const response = await apiClient.get<
      | MobileApiResponse<ApiListResponse<PermitDto>>
      | { data: PermitDto[]; links?: Record<string, string | null>; meta?: Record<string, unknown> }
      | PermitDto[]
    >("/api/mobile/operations/permits", {
      params: {
        search: params?.search,
        status: params?.status === "all" ? undefined : params?.status,
        academic_period_id: params?.academic_period_id ?? params?.academicPeriodId,
        page: params?.page,
        per_page: params?.per_page ?? params?.limit,
      },
    });

    if (Array.isArray(response.data)) {
      return {
        items: response.data.map(normalizePermit),
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        },
      };
    }

    if ("meta" in response.data && Array.isArray(response.data.data)) {
      const data = unwrapPaginated<PermitDto>(response.data);

      return {
        items: data.items.map(normalizePermit),
        pagination: data.pagination,
      };
    }

    const data = getMobileData(response.data as MobileApiResponse<ApiListResponse<PermitDto>>);

    return {
      items: data.items.map(normalizePermit),
      pagination: data.pagination,
    };
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getPermitById(id: string) {
  const permits = await getPermits({ search: id, page: 1, limit: 20 });
  return permits.find((permit) => permit.id === id) ?? null;
}

export async function getPermitsByStudentId(studentId: string) {
  return getPermits({ search: studentId, page: 1, limit: 100 });
}

export async function getLatestPermitByStudentId(studentId: string) {
  const permits = await getPermitsByStudentId(studentId);

  return (
    permits.sort((left, right) => {
      return (
        new Date(right.startDate).getTime() -
        new Date(left.startDate).getTime()
      );
    })[0] ?? null
  );
}

export async function getPermitIssuanceConfig() {
  try {
    const response =
      await apiClient.get<
        | PermitIssuanceConfigDto
        | {
            data: PermitIssuanceConfigDto;
          }
        | {
            permit_requests_enabled?: boolean;
            default_amount?: string | number;
            currency?: string;
            active_academic_period?: {
              academic_year?: string | null;
              semester?: string | null;
            } | null;
          }
      >(
        "/api/mobile/permit-requests/options",
      );
    const data = unwrapData<
      PermitIssuanceConfigDto & {
        permit_requests_enabled?: boolean;
        default_amount?: string | number;
        active_academic_period?: {
          academic_year?: string | null;
          semester?: string | null;
        } | null;
      }
    >(response.data);

    return normalizePermitIssuanceConfig({
      ...data,
      enabled: data.enabled ?? data.permit_requests_enabled,
      defaultAmount: Number(data.defaultAmount ?? data.default_amount ?? 0),
      academicYear:
        data.academicYear ?? data.active_academic_period?.academic_year ?? null,
      semester: data.semester ?? data.active_academic_period?.semester ?? null,
    });
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function issuePermitForStudent(studentId: string) {
  try {
    const response = await apiClient.post<
      | PermitDto
      | { permit: PermitDto }
      | { data: PermitDto | { permit: PermitDto } }
      | MobileApiResponse<PermitDto | { permit: PermitDto }>
    >("/api/mobile/operations/permits/issue", {
      student_number: studentId,
      student_id: studentId,
    });
    const data = unwrapData<PermitDto | { permit: PermitDto }>(response.data);

    return normalizePermit("permit" in data ? data.permit : data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getStudentPermits() {
  try {
    const response = await apiClient.get<
      PermitDto[] | { permits: PermitDto[] } | MobileApiResponse<PermitDto[] | { permits: PermitDto[] }>
    >("/api/mobile/student/permits");
    const data = unwrapData<PermitDto[] | { permits: PermitDto[] }>(
      response.data,
    );
    const permits = Array.isArray(data) ? data : data.permits;

    return permits.map(normalizePermit);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.status === 404) {
      return [];
    }

    throw toUserFacingError(error);
  }
}
