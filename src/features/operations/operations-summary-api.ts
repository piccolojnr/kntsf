import { apiClient } from "@/lib/api/api-client";
import { toUserFacingError } from "@/lib/api/api-error";
import { unwrapData } from "@/lib/api/api-response";

export type OperationsSummary = {
  totalStudents: number;
  activePermits: number;
  activeNfcCards: number;
  verificationsToday: number;
  failedVerificationsToday: number;
  pendingPermitRequests: number;
  paidNotIssuedRequests: number;
};

type OperationsSummaryDto = Partial<OperationsSummary> & {
  total_students?: number;
  active_permits?: number;
  active_nfc_cards?: number;
  verifications_today?: number;
  failed_verifications_today?: number;
  pending_permit_requests?: number;
  paid_not_issued_requests?: number;
};

function numberOrZero(value: unknown) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeOperationsSummary(dto: OperationsSummaryDto): OperationsSummary {
  return {
    totalStudents: numberOrZero(dto.totalStudents ?? dto.total_students),
    activePermits: numberOrZero(dto.activePermits ?? dto.active_permits),
    activeNfcCards: numberOrZero(dto.activeNfcCards ?? dto.active_nfc_cards),
    verificationsToday: numberOrZero(
      dto.verificationsToday ?? dto.verifications_today,
    ),
    failedVerificationsToday: numberOrZero(
      dto.failedVerificationsToday ?? dto.failed_verifications_today,
    ),
    pendingPermitRequests: numberOrZero(
      dto.pendingPermitRequests ?? dto.pending_permit_requests,
    ),
    paidNotIssuedRequests: numberOrZero(
      dto.paidNotIssuedRequests ?? dto.paid_not_issued_requests,
    ),
  };
}

export async function getOperationsSummary() {
  try {
    const response = await apiClient.get<
      OperationsSummaryDto | { data: OperationsSummaryDto }
    >("/api/mobile/operations/summary");
    const data = unwrapData<OperationsSummaryDto>(response.data);

    return normalizeOperationsSummary(data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}
