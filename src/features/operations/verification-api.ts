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
  return {
    ...dto,
    card: dto.card ? { ...dto.card } : null,
    permit: dto.permit ? { ...dto.permit } : null,
    student: dto.student ? { ...dto.student } : null,
    log: normalizeVerificationLog(dto.log),
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
      return "no_active_permit";
    case "card_not_registered":
      return "card_not_registered";
    case "card_inactive":
      return "card_inactive";
    default:
      return "denied";
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
  // TODO(real-api): replace mock logs with backend audit/verification logs endpoint.
  await simulateDelay(220);
  return mockVerificationLogs.map(cloneVerificationLog);
}

export async function scanCardByUid(uid: string): Promise<ScanCardResult> {
  // TODO(real-api): replace mock UID verification with POST /api/mobile/staff/scan-card.
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
  // TODO(real-api): replace mock student ID verification with backend permit verification endpoint.
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

export async function verifyPermit(input: {
  method: VerificationMethod;
  value: string;
}) {
  if (input.method === "card_uid") {
    return scanCardByUid(input.value);
  }

  return verifyPermitByStudentId(input.value);
}

export async function issuePermitFromVerification(result: VerificationResult) {
  if (!result.student) {
    throw new Error("A student record is required before issuing a permit.");
  }

  const issuanceConfig = await getPermitIssuanceConfig();

  if (!issuanceConfig.enabled) {
    throw new Error("Permit issuance is currently closed.");
  }

  const permit = await issuePermitForStudent(result.student.id);

  return {
    permit,
    issuanceConfig,
  };
}

export const getScanLogs = getVerificationLogs;
