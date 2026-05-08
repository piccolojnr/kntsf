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

type AuditLogDto = Omit<Partial<AuditLogItem>, "actor"> & {
  id: string | number;
  createdAt?: string;
  message?: string;
  description?: string;
  metadata?: unknown;
  actor?: string | { name?: string; email?: string; role?: string };
  user?: { name?: string; email?: string; role?: string };
  type?: string;
  event?: string;
  result?: string;
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
  const actor =
    typeof dto.actor === "string"
      ? dto.actor
      : dto.actor?.name ??
        dto.actor?.email ??
        dto.user?.name ??
        dto.user?.email ??
        "System";

  return {
    id: String(dto.id),
    actor,
    action: dto.action ?? dto.event ?? dto.type ?? "Activity recorded",
    timestamp: dto.timestamp ?? dto.createdAt ?? "",
    detail: dto.detail ?? dto.message ?? dto.description ?? "",
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
