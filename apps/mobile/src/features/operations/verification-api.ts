import { getPermitIssuanceConfig } from "@/features/permits/permit-api";
import { Permit } from "@/features/permits/permit-types";
import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { ApiListResponse } from "@/lib/api/api-types";

import {
  VerificationLogDto,
  VerificationMethod,
  VerificationOutcome,
  VerificationReason,
  VerificationDecision,
  VerificationLog,
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

function normalizeVerificationLog(dto: VerificationLogDto): VerificationLog {
  const reason = dto.reason ?? "unknown_error";
  const outcome = dto.outcome ?? getOutcomeFromReason(reason);
  const decision = dto.decision ?? getDecisionFromReason(reason);
  const checkedAt = dto.checkedAt ?? dto.createdAt ?? dto.scannedAt ?? "";

  return {
    ...dto,
    id: String(dto.id),
    method: dto.method ?? "student_id",
    value: dto.value ?? "",
    result: dto.result ?? outcome,
    scannedAt: dto.scannedAt ?? checkedAt,
    checkedAt,
    createdAt: dto.createdAt ?? checkedAt,
    outcome,
    reason,
    decision,
    message: dto.message ?? "Verification completed.",
    cardId: dto.cardId ?? dto.card?.id,
    permitId: dto.permitId ?? dto.permit?.id,
    studentId: dto.studentId ?? dto.student?.id,
    student: dto.student ?? null,
    permit: dto.permit ?? null,
    card: dto.card ?? null,
    verifier: dto.verifier ?? null,
  };
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

function getDecisionFromReason(reason: VerificationReason): VerificationDecision {
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

    const result = normalizeVerificationResult(getMobileData(response.data));

    if (result.canIssuePermit && !result.issuanceConfig) {
      result.issuanceConfig = await getPermitIssuanceConfig();
    }

    return result;
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

    const verification = (data.verificationResult ?? data.verification)
      ? normalizeVerificationResult(data.verificationResult ?? data.verification!)
      : null;

    if (verification?.canIssuePermit && !verification.issuanceConfig) {
      verification.issuanceConfig = await getPermitIssuanceConfig();
    }

    return {
      permit: data.permit,
      verification,
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
  try {
    const response = await apiClient.get<
      MobileApiResponse<ApiListResponse<VerificationLogDto> | VerificationLogDto[]>
    >("/api/mobile/operations/verifications");
    const data = getMobileData(response.data);
    const logs = Array.isArray(data) ? data : data.items;

    return logs.map(normalizeVerificationLog);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function scanCardByUid(uid: string): Promise<VerificationResult> {
  return postVerification("/api/mobile/verify/card", { uid });
}

export async function verifyPermitByStudentId(
  studentId: string,
): Promise<VerificationResult> {
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
