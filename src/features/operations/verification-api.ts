import { USE_MOCK_API } from "@/constants/config";
import { getCardByUid } from "@/features/cards/card-api";
import { StudentCard } from "@/features/cards/card-types";
import {
  getLatestPermitByStudentId,
  getPermitIssuanceConfig,
  getPermitsByStudentId,
  issuePermitForStudent,
} from "@/features/permits/permit-api";
import { Permit } from "@/features/permits/permit-types";
import {
  getStudentById,
  getStudentByStudentId,
} from "@/features/students/student-api";
import { Student } from "@/features/students/student-types";
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

function buildVerificationLog(
  method: VerificationMethod,
  value: string,
  reason: VerificationReason,
  message: string,
  extras?: {
    card?: StudentCard | null;
    permit?: Permit | null;
    student?: Student | null;
  },
) {
  const checkedAt = new Date().toISOString();
  const log: ScanLog = {
    id: `scan-log-${mockVerificationLogs.length + 1}`,
    method,
    value,
    scannedAt: checkedAt,
    checkedAt,
    outcome: getOutcomeFromReason(reason),
    reason,
    decision: getDecisionFromReason(reason),
    message,
    cardId: extras?.card?.id,
    permitId: extras?.permit?.id,
    studentId: extras?.student?.id,
  };

  mockVerificationLogs.unshift(log);

  return cloneVerificationLog(log);
}

function createResult(
  method: VerificationMethod,
  value: string,
  reason: VerificationReason,
  message: string,
  context?: {
    card?: StudentCard | null;
    permit?: Permit | null;
    student?: Student | null;
  },
): ScanCardResult {
  const log = buildVerificationLog(method, value, reason, message, context);
  const decision = getDecisionFromReason(reason);

  return normalizeVerificationResult({
    outcome: getOutcomeFromReason(reason),
    reason,
    checkedAt: log.checkedAt,
    status: decision,
    decision,
    message,
    method,
    value,
    student: context?.student ?? null,
    card: context?.card ?? null,
    permit: context?.permit ?? null,
    canIssuePermit: false,
    issuanceConfig: null,
    log,
  });
}

function validateStudentId(studentId: string) {
  const normalizedStudentId = studentId.trim();

  if (!/^\d+$/.test(normalizedStudentId)) {
    throw new Error("Student ID must contain digits only.");
  }

  if (normalizedStudentId.length !== 8) {
    throw new Error("Student ID should be 8 digits.");
  }

  return normalizedStudentId;
}

async function evaluatePermitForStudent(
  method: VerificationMethod,
  value: string,
  student: Student,
  extras?: {
    card?: StudentCard | null;
  },
): Promise<ScanCardResult> {
  const issuanceConfig = await getPermitIssuanceConfig();
  const permits = await getPermitsByStudentId(student.id);
  const activePermit = permits.find((permit) => permit.status === "active");

  if (activePermit) {
    return {
      ...createResult(
        method,
        value,
        "active_permit",
        "Active permit verified. Access granted.",
        {
          card: extras?.card,
          permit: activePermit,
          student,
        },
      ),
      issuanceConfig,
    };
  }

  const latestPermit = await getLatestPermitByStudentId(student.id);

  if (latestPermit?.status === "expired") {
    return {
      ...createResult(
        method,
        value,
        "expired_permit",
        "The student's latest permit has expired.",
        {
          card: extras?.card,
          permit: latestPermit,
          student,
        },
      ),
      canIssuePermit: issuanceConfig.enabled,
      issuanceConfig,
    };
  }

  if (latestPermit?.status === "revoked") {
    return {
      ...createResult(
        method,
        value,
        "revoked_permit",
        "The student's latest permit was revoked.",
        {
          card: extras?.card,
          permit: latestPermit,
          student,
        },
      ),
      canIssuePermit: issuanceConfig.enabled,
      issuanceConfig,
    };
  }

  return {
    ...createResult(
      method,
      value,
      "no_active_permit",
      "Student found, but there is no active permit for entry.",
      {
        card: extras?.card,
        permit: latestPermit,
        student,
      },
    ),
    canIssuePermit: issuanceConfig.enabled,
    issuanceConfig,
  };
}

export async function getVerificationLogs() {
  await simulateDelay(220);
  return mockVerificationLogs.map(cloneVerificationLog);
}

export async function scanCardByUid(uid: string): Promise<ScanCardResult> {
  if (!USE_MOCK_API) {
    return postVerification("/api/mobile/verify/card", { uid });
  }

  await simulateDelay(350);

  const normalizedUid = uid.trim().toUpperCase();
  const card = await getCardByUid(normalizedUid);

  if (!card) {
    return createResult(
      "card_uid",
      normalizedUid,
      "card_not_registered",
      "Card not registered in the system.",
    );
  }

  if (card.status !== "active") {
    return createResult(
      "card_uid",
      normalizedUid,
      "card_inactive",
      `This card is ${card.status} and cannot be used for entry.`,
      { card },
    );
  }

  const student = await getStudentById(card.studentId);

  if (!student) {
    return createResult(
      "card_uid",
      normalizedUid,
      "student_not_found",
      "No student record was found for this card.",
      { card },
    );
  }

  return evaluatePermitForStudent("card_uid", normalizedUid, student, { card });
}

export async function verifyPermitByStudentId(
  studentId: string,
): Promise<ScanCardResult> {
  if (!USE_MOCK_API) {
    return postVerification("/api/mobile/verify/student", { studentId });
  }

  await simulateDelay(300);

  const normalizedStudentId = validateStudentId(studentId);
  const student = await getStudentByStudentId(normalizedStudentId);

  if (!student) {
    return createResult(
      "student_id",
      normalizedStudentId,
      "student_not_found",
      "No student record was found for this student ID. Please add the student in the dashboard system.",
    );
  }

  return evaluatePermitForStudent("student_id", normalizedStudentId, student);
}

export async function verifyPermitByCardUid(uid: string) {
  return scanCardByUid(uid);
}

export async function verifyPermitByPermitCode(code: string) {
  if (!USE_MOCK_API) {
    return postVerification("/api/mobile/verify/permit-code", { code });
  }

  await simulateDelay(300);

  return createResult(
    "permit_code",
    code.trim(),
    "invalid_input",
    "Permit code verification is only available when connected to the backend.",
  );
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
  if (!USE_MOCK_API) {
    return postIssuePermit(studentId);
  }

  const student = await getStudentByStudentId(studentId);
  return {
    permit: await issuePermitForStudent(student?.id ?? studentId),
    verification: null,
  };
}

export async function issuePermit(studentId: string) {
  const response = await issuePermitWithVerification(studentId);
  return response.permit;
}

export async function issuePermitFromVerification(result: VerificationResult) {
  if (!result.student) {
    throw new Error("A student record is required before issuing a permit.");
  }

  const issuanceConfig = await getPermitIssuanceConfig();

  if (!issuanceConfig.enabled) {
    throw new Error("Permit issuance is currently closed.");
  }

  const studentId = result.student.studentId ?? result.student.id;
  const response = !USE_MOCK_API
    ? await issuePermitWithVerification(studentId)
    : {
        permit: await issuePermit(studentId),
        verification: null,
      };

  return {
    permit: response.permit,
    issuanceConfig,
    verification: response.verification,
  };
}

export const getScanLogs = getVerificationLogs;
