import { USE_MOCK_API } from "@/constants/config";
import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { ApiListResponse } from "@/lib/api/api-types";
import { simulateDelay } from "@/lib/api/mock-api";

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

const mockPermits: Permit[] = [
  {
    id: "permit-1",
    studentId: "student-1",
    permitCode: "PRM-AMA-2026",
    status: "active",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
  {
    id: "permit-2",
    studentId: "student-2",
    permitCode: "PRM-KWE-2025",
    status: "expired",
    startDate: "2025-01-01T00:00:00.000Z",
    expiryDate: "2025-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
  {
    id: "permit-3",
    studentId: "student-3",
    permitCode: "PRM-EFU-2026",
    status: "active",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
  {
    id: "permit-4",
    studentId: "student-4",
    permitCode: "PRM-KOJ-2026",
    status: "revoked",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
];

const mockPermitIssuanceConfig: PermitIssuanceConfig = {
  enabled: true,
  defaultAmount: 850,
  expiryDate: "2026-12-31T23:59:59.000Z",
  academicYear: "2025/2026",
};

function clonePermit(permit: Permit) {
  return { ...permit };
}

function clonePermitIssuanceConfig() {
  return { ...mockPermitIssuanceConfig };
}

function normalizePermit(dto: PermitDto): Permit {
  return {
    id: String(dto.id),
    studentId: dto.studentId ?? dto.student_id ?? "",
    permitCode: dto.permitCode ?? dto.permit_code ?? dto.code ?? "",
    status: dto.status ?? "expired",
    startDate: dto.startDate ?? dto.start_date ?? "",
    expiryDate: dto.expiryDate ?? dto.expiry_date ?? dto.expiresAt ?? "",
    amountPaid: dto.amountPaid ?? dto.amount_paid ?? dto.amount ?? 0,
    student: dto.student ?? null,
  };
}

function normalizePermitIssuanceConfig(
  dto: PermitIssuanceConfigDto,
): PermitIssuanceConfig {
  return {
    enabled: dto.enabled,
    defaultAmount: dto.defaultAmount,
    expiryDate: dto.expiryDate,
    academicYear: dto.academicYear,
  };
}

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

async function getMockPermits(params?: OperationsPermitListParams) {
  await simulateDelay(250);
  const search = params?.search?.trim().toLowerCase();
  const status = params?.status === "all" ? undefined : params?.status;
  const permits = mockPermits.map(clonePermit).map(normalizePermit);

  return permits.filter((permit) => {
    const matchesStatus = !status || permit.status === status;
    const matchesSearch =
      !search ||
      permit.permitCode.toLowerCase().includes(search) ||
      permit.studentId.toLowerCase().includes(search) ||
      permit.student?.name?.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });
}

export async function getPermits(params?: OperationsPermitListParams) {
  if (USE_MOCK_API) {
    return getMockPermits(params);
  }

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

    return getMobileData(response.data).items.map(normalizePermit);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.statusCode === 404) {
      return getMockPermits(params);
    }

    throw toUserFacingError(error);
  }
}

export async function getPermitById(id: string) {
  // TODO(real-api): replace lookup with apiClient.get(`/api/mobile/permits/${id}`).
  await simulateDelay(180);

  const permit = mockPermits.find((item) => item.id === id);

  return permit ? normalizePermit(clonePermit(permit)) : null;
}

export async function getPermitsByStudentId(studentId: string) {
  // TODO(real-api): replace lookup with student permit endpoint.
  await simulateDelay(180);

  return mockPermits
    .filter((item) => item.studentId === studentId)
    .map(clonePermit)
    .map(normalizePermit);
}

export async function getLatestPermitByStudentId(studentId: string) {
  const permits = await getPermitsByStudentId(studentId);

  return permits.sort((left, right) => {
    return (
      new Date(right.startDate).getTime() - new Date(left.startDate).getTime()
    );
  })[0] ?? null;
}

export async function getPermitIssuanceConfig() {
  // TODO(real-api): replace mock config with backend permit issuance config.
  await simulateDelay(180);
  return normalizePermitIssuanceConfig(clonePermitIssuanceConfig());
}

function createPermitCode(studentId: string, academicYear: string) {
  const suffix = studentId.split("-").at(-1)?.toUpperCase() ?? "STD";
  const year = academicYear.split("/")[1] ?? "2026";
  return `PRM-${suffix}-${year}`;
}

export async function issuePermitForStudent(studentId: string) {
  // TODO(real-api): replace mock issuing with apiClient.post("/api/mobile/permits/issue").
  await simulateDelay(320);

  const config = clonePermitIssuanceConfig();

  if (!config.enabled) {
    throw new Error("Permit issuance is currently closed.");
  }

  const nextPermit: Permit = {
    id: `permit-${mockPermits.length + 1}`,
    studentId,
    permitCode: createPermitCode(studentId, config.academicYear ?? "2025/2026"),
    status: "active",
    startDate: new Date().toISOString(),
    expiryDate: config.expiryDate,
    amountPaid: config.defaultAmount,
  };

  mockPermits.unshift(nextPermit);

  return normalizePermit(clonePermit(nextPermit));
}

export async function getStudentPermits(studentId?: string) {
  void studentId;

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
