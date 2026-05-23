import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { unwrapData, unwrapPaginated } from "@/lib/api/api-response";
import { ApiListResponse } from "@/lib/api/api-types";
import { normalizeStudent } from "@/features/students/student-api";
import { StudentDto } from "@/features/students/student-types";

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
  const startDate = dto.startDate ?? dto.starts_at ?? dto.start_date ?? "";
  const codeLast4 = dto.codeLast4 ?? dto.code_last4 ?? null;

  return {
    id: String(dto.id ?? ""),
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
    startDate,
    expiryDate,
    amountPaid: Number(dto.amountPaid ?? dto.amount_paid ?? dto.amount ?? 0),
    currency: dto.currency ?? "GHS",
    codeLast4,
    academicPeriod: dto.academicPeriod ?? dto.academic_period ?? null,
    qrCode: dto.qrCode,
    student: dto.student ? normalizeStudent(dto.student as StudentDto) : null,
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
  const activeAcademicPeriod =
    dto.activeAcademicPeriod ?? dto.active_academic_period ?? null;
  const selectedStudent = dto.selectedStudent ?? dto.selected_student ?? dto.student ?? null;
  const selectedStudentState = dto.selected_student_state;
  const blockingReasons =
    dto.blocking?.reasons ??
    dto.blocking?.reason_keys ??
    selectedStudentState?.blocking_reasons ??
    selectedStudentState?.reason_keys ??
    dto.blocking_reasons ??
    dto.blocking_reason_keys ??
    [];
  const hasOpenPermitRequest = Boolean(
      dto.blocking?.has_open_permit_request ??
      dto.blocking?.has_pending_request ??
      selectedStudentState?.has_open_permit_request ??
      selectedStudentState?.has_pending_request ??
      dto.has_open_permit_request ??
      dto.has_pending_request ??
      dto.open_permit_request_exists,
  );

  return {
    enabled: dto.enabled ?? dto.issuanceEnabled ?? dto.permit_requests_enabled ?? false,
    defaultAmount: Number(dto.defaultAmount ?? dto.default_amount ?? dto.amount ?? 0),
    currency: dto.currency,
    startDate:
      dto.startDate ??
      dto.start_date ??
      dto.starts_at ??
      dto.default_start_date ??
      dto.default_starts_at,
    expiryDate:
      dto.expiryDate ??
      dto.expiry_date ??
      dto.expiresAt ??
      dto.expires_at ??
      dto.default_end_date ??
      dto.default_ends_at ??
      dto.default_expires_at ??
      "",
    academicYear:
      dto.academicYear ??
      dto.academic_year ??
      activeAcademicPeriod?.academic_year ??
      null,
    semester: dto.semester ?? activeAcademicPeriod?.semester ?? null,
    validityDays: optionalNumber(
      dto.validityDays ?? dto.validity_days ?? dto.default_validity_days,
    ),
    permitRequestsEnabled: dto.permitRequestsEnabled ?? dto.permit_requests_enabled,
    activeAcademicPeriod,
    courseOptions: dto.courseOptions ?? dto.course_options ?? dto.courses ?? [],
    levelOptions: dto.levelOptions ?? dto.level_options ?? dto.levels ?? [],
    studentNumberPrefix: dto.studentNumberPrefix ?? dto.student_number_prefix ?? null,
    selectedStudent: selectedStudent ? normalizeStudent(selectedStudent as StudentDto) : null,
    blocking: {
      hasActivePermit: Boolean(
        dto.blocking?.has_active_permit ??
          selectedStudentState?.has_active_permit ??
          dto.has_active_permit,
      ),
      hasOpenPermitRequest,
      missingEmail: Boolean(
        dto.blocking?.missing_email ??
          dto.missing_email ??
          selectedStudentState?.missing_email ??
          dto.missing_contact?.email,
      ),
      missingPhone: Boolean(
        dto.blocking?.missing_phone ??
          dto.missing_phone ??
          selectedStudentState?.missing_phone ??
          dto.missing_contact?.phone,
      ),
      reasons: blockingReasons,
    },
  };
}

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
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

export async function getOperationsPermitIssuanceConfig(studentId?: string | number) {
  try {
    const response = await apiClient.get<
      PermitIssuanceConfigDto | { data: PermitIssuanceConfigDto }
    >("/api/mobile/operations/permits/options", {
      params: {
        student_id: studentId,
      },
    });
    const data = unwrapData<PermitIssuanceConfigDto>(response.data);

    return normalizePermitIssuanceConfig(data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function issuePermitForStudent(input: {
  studentId: string;
  studentEmail?: string | null;
  academicPeriodId?: string | number | null;
}) {
  try {
    const response = await apiClient.post<
      | PermitDto
      | { permit: PermitDto }
      | { data: PermitDto | { permit: PermitDto } }
      | MobileApiResponse<PermitDto | { permit: PermitDto }>
    >("/api/mobile/operations/permits/issue", {
      student_id: input.studentId,
      student_email: input.studentEmail || undefined,
      academic_period_id: input.academicPeriodId ?? undefined,
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
