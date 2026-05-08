import { apiClient } from "@/lib/api/api-client";
import { toUserFacingError } from "@/lib/api/api-error";
import { ApiListResponse } from "@/lib/api/api-types";

export type AuditLogTone = "primary" | "success" | "warning" | "danger";

export type AuditLogItem = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: string;
  tone: AuditLogTone;
};

type AuditLogDto = Partial<AuditLogItem> & {
  id: string | number;
  createdAt?: string;
  message?: string;
};

type MobileApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

function normalizeAuditLog(dto: AuditLogDto): AuditLogItem {
  return {
    id: String(dto.id),
    actor: dto.actor ?? "System",
    action: dto.action ?? "Activity recorded",
    timestamp: dto.timestamp ?? dto.createdAt ?? "",
    detail: dto.detail ?? dto.message ?? "",
    tone: dto.tone ?? "primary",
  };
}

export async function getAuditLogs() {
  try {
    const response = await apiClient.get<
      MobileApiResponse<ApiListResponse<AuditLogDto> | AuditLogDto[]>
    >("/api/mobile/operations/audit-logs");
    const data = getMobileData(response.data);
    const logs = Array.isArray(data) ? data : data.items;

    return logs.map(normalizeAuditLog);
  } catch (error) {
    throw toUserFacingError(error);
  }
}
