import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
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
  page?: number;
  limit?: number;
};

export type PermitsListResult = ApiListResponse<Permit>;

function normalizePermit(dto: PermitDto): Permit {
  return {
    id: String(dto.id),
    studentId:
      dto.studentId ?? dto.student_id ?? dto.student?.id?.toString() ?? "",
    permitCode:
      dto.permitCode ??
      dto.permit_code ??
      dto.originalCode ??
      dto.code ??
      "",
    status: dto.status ?? "expired",
    startDate: dto.startDate ?? dto.start_date ?? "",
    expiryDate: dto.expiryDate ?? dto.expiry_date ?? dto.expiresAt ?? "",
    amountPaid: dto.amountPaid ?? dto.amount_paid ?? dto.amount ?? 0,
    qrCode: dto.qrCode,
    student: dto.student ?? null,
  };
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
      MobileApiResponse<ApiListResponse<PermitDto>>
    >("/api/mobile/operations/permits", {
      params: {
        search: params?.search,
        status: params?.status === "all" ? undefined : params?.status,
        page: params?.page,
        limit: params?.limit,
      },
    });

    const data = getMobileData(response.data);

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
      MobileApiResponse<ApiListResponse<PermitDto>>
    >("/api/mobile/operations/permits", {
      params: {
        search: params?.search,
        status: params?.status === "all" ? undefined : params?.status,
        page: params?.page,
        limit: params?.limit,
      },
    });
    const data = getMobileData(response.data);

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
      await apiClient.get<MobileApiResponse<PermitIssuanceConfigDto>>(
        "/api/mobile/operations/permit-config",
      );

    return normalizePermitIssuanceConfig(getMobileData(response.data));
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function issuePermitForStudent(studentId: string) {
  try {
    const response = await apiClient.post<
      MobileApiResponse<PermitDto | { permit: PermitDto }>
    >("/api/mobile/permits/issue", { studentId });
    const data = getMobileData(response.data);

    return normalizePermit("permit" in data ? data.permit : data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getStudentPermits() {
  try {
    const response = await apiClient.get<
      MobileApiResponse<PermitDto[] | { permits: PermitDto[] }>
    >("/api/mobile/student/permits");
    const data = getMobileData(response.data);
    const permits = Array.isArray(data) ? data : data.permits;

    return permits.map(normalizePermit);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.statusCode === 404) {
      return [];
    }

    throw toUserFacingError(error);
  }
}
