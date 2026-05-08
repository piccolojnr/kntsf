import { Permit } from "@/features/permits/permit-types";
import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { simulateDelay } from "@/lib/api/mock-api";

import {
  ScanCardResult,
  ScanDecision,
  ScanLog,
  VerificationLogDto,
  VerificationMethod,
  VerificationOutcome,
  VerificationReason,
  VerificationResult,
  VerificationResultDto,
} from "./verification-types";

type MobileApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type IssuePermitResponseDto = {
  permit: Permit;
  verificationResult?: VerificationResultDto | null;
  verification?: VerificationResultDto;
};

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

const mockVerificationLogs: ScanLog[] = [
  {
    id: "scan-log-1",
    method: "card_uid",
    value: "UID-AMA-001",
    scannedAt: "2026-05-03T08:30:00.000Z",
    checkedAt: "2026-05-03T08:30:00.000Z",
    outcome: "allowed",
    reason: "active_permit",
    decision: "allowed",
    message: "Active permit verified. Access granted.",
    studentId: "student-1",
    cardId: "card-1",
    permitId: "permit-1",
  },
  {
    id: "scan-log-2",
    method: "card_uid",
    value: "UID-EFUA-003",
    scannedAt: "2026-05-03T10:10:00.000Z",
    checkedAt: "2026-05-03T10:10:00.000Z",
    outcome: "denied",
    reason: "card_inactive",
    decision: "card_inactive",
    message: "This card is not active for scanning.",
    studentId: "student-3",
    cardId: "card-3",
  },
  {
    id: "scan-log-3",
    method: "card_uid",
    value: "UID-UNKNOWN-999",
    scannedAt: "2026-05-03T12:45:00.000Z",
    checkedAt: "2026-05-03T12:45:00.000Z",
    outcome: "denied",
    reason: "card_not_registered",
    decision: "card_not_registered",
    message: "Card not registered in the system.",
  },
  {
    id: "scan-log-4",
    method: "student_id",
    value: "26102859",
    scannedAt: "2026-05-03T14:00:00.000Z",
    checkedAt: "2026-05-03T14:00:00.000Z",
    outcome: "allowed",
    reason: "active_permit",
    decision: "allowed",
    message: "Active permit verified. Access granted.",
    studentId: "student-1",
    permitId: "permit-1",
  },
];

function normalizeVerificationLog(dto: VerificationLogDto): ScanLog {
  return { ...dto };
}

function normalizeVerificationResult(
  dto: VerificationResultDto,
): VerificationResult {
  const checkedAt = dto.checkedAt ?? new Date().toISOString();
  const reason = dto.reason ?? "unknown_error";
  const decision = dto.decision ?? getDecisionFromReason(reason);
  const outcome = dto.outcome ?? getOutcomeFromReason(reason);
  const method = dto.method ?? "student_id";
  const value = dto.value ?? "";
  const message = dto.message ?? "Verification completed.";
  const log = dto.log
    ? normalizeVerificationLog(dto.log)
    : {
        id: `verification-${checkedAt}`,
        method,
        value,
        scannedAt: checkedAt,
        checkedAt,
        outcome,
        reason,
        decision,
        message,
        cardId: dto.card?.id,
        permitId: dto.permit?.id,
        studentId: dto.student?.id,
      };

  return {
    ...dto,
    checkedAt,
    outcome,
    reason,
    status: dto.status ?? decision,
    decision,
    message,
    method,
    value,
    card: dto.card ? { ...dto.card } : null,
    permit: dto.permit ? { ...dto.permit } : null,
    student: dto.student ? { ...dto.student } : null,
    canIssuePermit:
      dto.canIssuePermit ??
      (outcome === "warning" && reason !== "permit_issuance_disabled"),
    issuanceConfig: dto.issuanceConfig ?? null,
    log,
  };
}

function cloneVerificationLog(log: ScanLog) {
  return normalizeVerificationLog(log);
}

function getOutcomeFromReason(reason: VerificationReason): VerificationOutcome {
  switch (reason) {
    case "active_permit":
      return "allowed";
    case "expired_permit":
    case "revoked_permit":
    case "no_active_permit":
    case "permit_not_found":
      return "warning";
    case "permit_issuance_disabled":
      return "warning";
    default:
      return "denied";
  }
}

function getDecisionFromReason(reason: VerificationReason): ScanDecision {
  switch (reason) {
    case "active_permit":
      return "allowed";
    case "expired_permit":
      return "expired_permit";
    case "revoked_permit":
      return "revoked_permit";
    case "no_active_permit":
    case "permit_not_found":
      return "no_active_permit";
    case "card_not_registered":
      return "card_not_registered";
    case "card_inactive":
      return "card_inactive";
    case "permit_issuance_disabled":
      return "no_active_permit";
    default:
      return "denied";
  }
}

async function postVerification<TBody>(
  endpoint: string,
  body: TBody,
): Promise<VerificationResult> {
  try {
    const response = await apiClient.post<MobileApiResponse<VerificationResultDto>>(
      endpoint,
      body,
    );

    return normalizeVerificationResult(getMobileData(response.data));
  } catch (error) {
    throw toUserFacingError(error);
  }
}

async function postIssuePermit(studentId: string) {
  try {
    const response = await apiClient.post<MobileApiResponse<IssuePermitResponseDto>>(
      "/api/mobile/permits/issue",
      { studentId },
    );

    const data = getMobileData(response.data);

    return {
      permit: data.permit,
      verification: (data.verificationResult ?? data.verification)
        ? normalizeVerificationResult(data.verificationResult ?? data.verification!)
        : null,
    };
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.statusCode === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (normalizedError.statusCode === 403) {
      throw new Error("You do not have permission to issue permits.");
    }

    throw new Error(normalizedError.message);
  }
}

export async function getVerificationLogs() {
  await simulateDelay(220);
  return mockVerificationLogs.map(cloneVerificationLog);
}

export async function scanCardByUid(uid: string): Promise<ScanCardResult> {
  return postVerification("/api/mobile/verify/card", { uid });
}

export async function verifyPermitByStudentId(
  studentId: string,
): Promise<ScanCardResult> {
  return postVerification("/api/mobile/verify/student", { studentId });
}

export async function verifyPermitByCardUid(uid: string) {
  return scanCardByUid(uid);
}

export async function verifyPermitByPermitCode(code: string) {
  return postVerification("/api/mobile/verify/permit-code", { code });
}

export async function verifyPermit(input: {
  method: VerificationMethod;
  value: string;
}) {
  if (input.method === "card_uid") {
    return scanCardByUid(input.value);
  }

  if (input.method === "permit_code") {
    return verifyPermitByPermitCode(input.value);
  }

  return verifyPermitByStudentId(input.value);
}

export async function issuePermitWithVerification(studentId: string) {
  return postIssuePermit(studentId);
}

export async function issuePermit(studentId: string) {
  const response = await issuePermitWithVerification(studentId);
  return response.permit;
}

export async function issuePermitFromVerification(result: VerificationResult) {
  if (!result.student) {
    throw new Error("A student record is required before issuing a permit.");
  }

  const studentId = result.student.studentId ?? result.student.id;
  const response = await issuePermitWithVerification(studentId);

  return {
    permit: response.permit,
    issuanceConfig:
      response.verification?.issuanceConfig ?? result.issuanceConfig ?? null,
    verification: response.verification,
  };
}

export const getScanLogs = getVerificationLogs;
