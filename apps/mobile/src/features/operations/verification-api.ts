import { normalizeCard } from "@/features/cards/card-api";
import { StudentCardDto } from "@/features/cards/card-types";
import {
  getOperationsPermitIssuanceConfig,
  normalizePermit,
} from "@/features/permits/permit-api";
import { Permit, PermitDto } from "@/features/permits/permit-types";
import { normalizeStudent } from "@/features/students/student-api";
import { StudentDto } from "@/features/students/student-types";
import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { unwrapData, unwrapPaginated } from "@/lib/api/api-response";
import { ApiListResponse } from "@/lib/api/api-types";

import {
  VerificationDecision,
  VerificationLog,
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
  permit?: Permit | PermitDto | null;
  verificationResult?: VerificationResultDto | null;
  verification?: VerificationResultDto;
};

type LaravelVerificationResultDto = Partial<VerificationResultDto> & {
  method?: string;
  result?: string;
  reason?: string | null;
  student?: StudentDto | null;
  permit?: PermitDto | null;
  card?: StudentCardDto | null;
  checked_at?: string;
  checkedAt?: string;
  message?: string;
  can_issue_permit?: boolean;
};

export type VerificationLogListParams = {
  method?: VerificationMethod | "all";
  result?: VerificationOutcome | VerificationDecision | "all";
  search?: string;
  page?: number;
  limit?: number;
  per_page?: number;
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
  dto: VerificationResultDto | LaravelVerificationResultDto,
): VerificationResult {
  const checkedAt =
    dto.checkedAt ??
    ("checked_at" in dto ? dto.checked_at : undefined) ??
    new Date().toISOString();
  const method = normalizeVerificationMethod(dto.method);
  const value = dto.value ?? "";
  const message = dto.message ?? "Verification completed.";
  const student = dto.student ? normalizeStudent(dto.student as StudentDto) : null;
  const permit = dto.permit ? normalizePermit(dto.permit as PermitDto) : null;
  const card = dto.card ? normalizeCard(dto.card as StudentCardDto) : null;
  const rawResult = "result" in dto ? dto.result : undefined;
  const reason = normalizeVerificationReason(rawResult ?? dto.reason, {
    hasPermit: Boolean(permit),
    hasStudent: Boolean(student),
    method,
  });
  const decision = dto.decision ?? getDecisionFromReason(reason);
  const outcome = dto.outcome ?? getOutcomeFromReason(reason);
  const explicitCanIssue =
    dto.canIssuePermit ??
    ("can_issue_permit" in dto ? dto.can_issue_permit : undefined);
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
      cardId: card?.id,
      permitId: permit?.id,
      studentId: student?.id,
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
    card,
    permit,
    student,
    canIssuePermit: explicitCanIssue ?? canOpenPermitIssueFlow(reason, student),
    issuanceConfig: dto.issuanceConfig ?? null,
    log,
  };
}

function normalizeVerificationMethod(method: unknown): VerificationMethod {
  if (method === "nfc" || method === "card_uid") {
    return "card_uid";
  }

  if (method === "permit_code") {
    return "permit_code";
  }

  return "student_id";
}

function normalizeVerificationReason(
  reason: unknown,
  context?: {
    hasPermit?: boolean;
    hasStudent?: boolean;
    method?: VerificationMethod;
  },
): VerificationReason {
  const normalizedReason =
    typeof reason === "string"
      ? reason.trim().toLowerCase().replace(/[\s-]+/g, "_")
      : "";

  if (
    normalizedReason.includes("no_active_permit") ||
    normalizedReason.includes("missing_permit") ||
    normalizedReason.includes("permit_missing") ||
    normalizedReason.includes("missing") ||
    normalizedReason.includes("no_permit")
  ) {
    return "no_active_permit";
  }

  if (
    normalizedReason.includes("student_not_found") ||
    normalizedReason.includes("student_not_registered")
  ) {
    return context?.hasStudent ? "no_active_permit" : "student_not_found";
  }

  if (
    normalizedReason.includes("permit_not_found") ||
    normalizedReason.includes("permit_not_registered")
  ) {
    return context?.hasStudent ? "no_active_permit" : "permit_not_found";
  }

  switch (normalizedReason) {
    case "valid":
    case "active_permit":
      return "active_permit";
    case "expired":
    case "expired_permit":
      return "expired_permit";
    case "revoked":
    case "revoked_permit":
      return "revoked_permit";
    case "not_found":
      if (context?.hasStudent && !context.hasPermit) {
        return "no_active_permit";
      }

      if (context?.method === "student_id") {
        return "student_not_found";
      }

      if (context?.method === "card_uid") {
        return "card_not_registered";
      }

      return "permit_not_found";
    case "permit_not_found":
      return "permit_not_found";
    case "card_inactive":
      return "card_inactive";
    case "card_not_registered":
      return "card_not_registered";
    case "student_not_found":
      return "student_not_found";
    case "no_active_permit":
      return "no_active_permit";
    case "invalid":
    case "mismatch":
    case "invalid_input":
      if (context?.hasStudent && !context.hasPermit) {
        return "no_active_permit";
      }

      return "invalid_input";
    case "permit_issuance_disabled":
      return "permit_issuance_disabled";
    default:
      return "unknown_error";
  }
}

function getOutcomeFromReason(reason: VerificationReason): VerificationOutcome {
  switch (reason) {
    case "active_permit":
      return "allowed";
    case "expired_permit":
    case "revoked_permit":
    case "no_active_permit":
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
      return "no_active_permit";
    case "permit_not_found":
      return "denied";
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

function canOpenPermitIssueFlow(
  reason: VerificationReason,
  student: ReturnType<typeof normalizeStudent> | null,
) {
  return Boolean(
    student &&
      (reason === "no_active_permit" ||
        reason === "expired_permit" ||
        reason === "revoked_permit" ||
        reason === "permit_not_found"),
  );
}

function hasHardIssuanceBlock(result: VerificationResult) {
  return Boolean(!result.issuanceConfig?.enabled);
}

function isPermitLike(value: unknown): value is PermitDto {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("id" in value || "code_last4" in value || "status" in value),
  );
}

function getIssuedPermit(data: IssuePermitResponseDto | PermitDto) {
  if ("permit" in data && data.permit) {
    return data.permit as PermitDto;
  }

  if (isPermitLike(data)) {
    return data;
  }

  return null;
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

    const result = normalizeVerificationResult(
      unwrapData<VerificationResultDto | LaravelVerificationResultDto>(
        response.data,
      ),
    );

    if (result.canIssuePermit && result.student && !result.issuanceConfig) {
      try {
        result.issuanceConfig = await getOperationsPermitIssuanceConfig(
          result.student.id,
        );
        result.canIssuePermit = !hasHardIssuanceBlock(result);
      } catch (error) {
        const normalizedError = normalizeApiError(error);

        if (normalizedError.status === 403) {
          result.canIssuePermit = false;
        }
      }
    }

    return result;
  } catch (error) {
    throw toUserFacingError(error);
  }
}

async function postIssuePermit(input: {
  studentId: string;
  studentEmail?: string | null;
  academicPeriodId?: string | number | null;
}) {
  try {
    const response = await apiClient.post<
      IssuePermitResponseDto | { data: IssuePermitResponseDto } | MobileApiResponse<IssuePermitResponseDto>
    >(
      "/api/mobile/operations/permits/issue",
      {
        student_id: input.studentId,
        student_email: input.studentEmail || undefined,
        academic_period_id: input.academicPeriodId ?? undefined,
      },
    );

    const data = unwrapData<IssuePermitResponseDto>(response.data);

    const verification = (data.verificationResult ?? data.verification)
      ? normalizeVerificationResult(data.verificationResult ?? data.verification!)
      : null;

    if (verification?.canIssuePermit && verification.student && !verification.issuanceConfig) {
      try {
        verification.issuanceConfig = await getOperationsPermitIssuanceConfig(
          verification.student.id,
        );
        verification.canIssuePermit = !hasHardIssuanceBlock(verification);
      } catch {
        verification.canIssuePermit = false;
      }
    }

    const issuedPermit = getIssuedPermit(data);

    if (!issuedPermit) {
      throw new Error("The permit issue response did not include a permit.");
    }

    return {
      permit: normalizePermit(issuedPermit),
      verification,
    };
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (normalizedError.status === 403) {
      throw new Error("You do not have permission to issue permits.");
    }

    throw new Error(normalizedError.message);
  }
}

export async function getVerificationLogs(params?: VerificationLogListParams) {
  try {
    const response = await apiClient.get<
      | MobileApiResponse<ApiListResponse<VerificationLogDto> | VerificationLogDto[]>
      | { data: VerificationLogDto[]; links?: Record<string, string | null>; meta?: Record<string, unknown> }
      | VerificationLogDto[]
    >("/api/mobile/operations/verification-logs", {
      params: {
        method: params?.method === "all" ? undefined : params?.method,
        result: params?.result === "all" ? undefined : params?.result,
        search: params?.search,
        page: params?.page,
        per_page: params?.per_page ?? params?.limit,
      },
    });

    if (Array.isArray(response.data)) {
      return response.data.map(normalizeVerificationLog);
    }

    if ("meta" in response.data && Array.isArray(response.data.data)) {
      return unwrapPaginated<VerificationLogDto>(response.data).items.map(
        normalizeVerificationLog,
      );
    }

    const data = getMobileData(
      response.data as MobileApiResponse<
        ApiListResponse<VerificationLogDto> | VerificationLogDto[]
      >,
    );
    const logs = Array.isArray(data) ? data : data.items;

    return logs.map(normalizeVerificationLog);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function scanCardByUid(uid: string): Promise<VerificationResult> {
  return postVerification("/api/mobile/verification/nfc", { uid });
}

export async function verifyPermitByStudentId(
  studentId: string,
): Promise<VerificationResult> {
  return postVerification("/api/mobile/verification/student-number", {
    student_number: studentId,
    studentId,
  });
}

export async function verifyPermitByCardUid(uid: string) {
  return scanCardByUid(uid);
}

export async function verifyPermitByPermitCode(code: string) {
  return postVerification("/api/mobile/verification/permit-code", { code });
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

export async function issuePermitWithVerification(input: {
  studentId: string;
  studentEmail?: string | null;
  academicPeriodId?: string | number | null;
}) {
  return postIssuePermit(input);
}

export async function issuePermit(input: {
  studentId: string;
  studentEmail?: string | null;
  academicPeriodId?: string | number | null;
}) {
  const response = await issuePermitWithVerification(input);
  return response.permit;
}

export async function issuePermitFromVerification(result: VerificationResult) {
  if (!result.student) {
    throw new Error("A student record is required before issuing a permit.");
  }

  const response = await issuePermitWithVerification({
    studentId: result.student.id,
    studentEmail: result.student.email,
    academicPeriodId: result.issuanceConfig?.activeAcademicPeriod?.id,
  });

  return {
    permit: response.permit,
    issuanceConfig:
      response.verification?.issuanceConfig ?? result.issuanceConfig ?? null,
    verification: response.verification,
  };
}
