import { apiClient } from "@/lib/api/api-client";
import { toUserFacingError } from "@/lib/api/api-error";
import { ApiListResponse } from "@/lib/api/api-types";

export type VerificationLogItem = {
  id: string;
  method: string;
  result: string;
  reason: string | null;
  createdAt: string;
  student: { id: number; student_number: string; name: string } | null;
  permit: { id: number; status: string; code_last4: string | null } | null;
  verifier: { id: number; name: string } | null;
};

type VerificationLogDto = {
  id: string | number;
  method?: string;
  result?: string;
  reason?: string | null;
  created_at?: string;
  student?: { id: number; student_number: string; name: string } | null;
  permit?: { id: number; status: string; code_last4: string | null } | null;
  verifier?: { id: number; name: string } | null;
};

function normalizeLog(dto: VerificationLogDto): VerificationLogItem {
  return {
    id: String(dto.id),
    method: dto.method ?? "",
    result: dto.result ?? "",
    reason: dto.reason ?? null,
    createdAt: dto.created_at ?? "",
    student: dto.student ?? null,
    permit: dto.permit ?? null,
    verifier: dto.verifier ?? null,
  };
}

type LaravelPaginatedResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

function isLaravelPaginated<T>(
  data: unknown,
): data is LaravelPaginatedResponse<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    Array.isArray((data as LaravelPaginatedResponse<T>).data) &&
    "meta" in data
  );
}

export type VerificationLogListParams = {
  method?: string;
  result?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type VerificationLogPageResult = ApiListResponse<VerificationLogItem>;

export async function getVerificationLogsPage(
  params?: VerificationLogListParams,
): Promise<VerificationLogPageResult> {
  try {
    const response = await apiClient.get<
      LaravelPaginatedResponse<VerificationLogDto> | VerificationLogDto[]
    >("/api/mobile/operations/verification-logs", {
      params: {
        method: params?.method || undefined,
        result: params?.result || undefined,
        search: params?.search,
        page: params?.page,
        per_page: params?.limit,
      },
    });

    if (isLaravelPaginated<VerificationLogDto>(response.data)) {
      const meta = response.data.meta ?? {};

      return {
        items: response.data.data.map(normalizeLog),
        pagination: {
          page: Number(meta.current_page ?? 1),
          limit: Number(meta.per_page ?? 15),
          total: Number(meta.total ?? 0),
          totalPages: Number(meta.last_page ?? 1),
        },
      };
    }

    if (Array.isArray(response.data)) {
      return {
        items: response.data.map(normalizeLog),
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        },
      };
    }

    return {
      items: [],
      pagination: {
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    throw toUserFacingError(error);
  }
}
