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
  VerificationMethod,
  VerificationResult,
} from "./scan-types";

const mockScanLogs: ScanLog[] = [
  {
    id: "scan-log-1",
    method: "uid",
    value: "UID-AMA-001",
    scannedAt: "2026-05-03T08:30:00.000Z",
    decision: "allowed",
    message: "Active permit verified. Access granted.",
    studentId: "student-1",
    cardId: "card-1",
    permitId: "permit-1",
  },
  {
    id: "scan-log-2",
    method: "uid",
    value: "UID-EFUA-003",
    scannedAt: "2026-05-03T10:10:00.000Z",
    decision: "card_inactive",
    message: "This card is not active for scanning.",
    studentId: "student-3",
    cardId: "card-3",
  },
  {
    id: "scan-log-3",
    method: "uid",
    value: "UID-UNKNOWN-999",
    scannedAt: "2026-05-03T12:45:00.000Z",
    decision: "card_not_registered",
    message: "Card not registered in the system.",
  },
  {
    id: "scan-log-4",
    method: "student_id",
    value: "26102859",
    scannedAt: "2026-05-03T14:00:00.000Z",
    decision: "allowed",
    message: "Active permit verified. Access granted.",
    studentId: "student-1",
    permitId: "permit-1",
  },
];

function cloneScanLog(log: ScanLog) {
  return { ...log };
}

function buildScanLog(
  method: VerificationMethod,
  value: string,
  decision: ScanDecision,
  message: string,
  extras?: {
    card?: StudentCard | null;
    permit?: Permit | null;
    student?: Student | null;
  },
) {
  const log: ScanLog = {
    id: `scan-log-${mockScanLogs.length + 1}`,
    method,
    value,
    scannedAt: new Date().toISOString(),
    decision,
    message,
    cardId: extras?.card?.id,
    permitId: extras?.permit?.id,
    studentId: extras?.student?.id,
  };

  mockScanLogs.unshift(log);

  return cloneScanLog(log);
}

function createResult(
  method: VerificationMethod,
  value: string,
  decision: ScanDecision,
  message: string,
  context?: {
    card?: StudentCard | null;
    permit?: Permit | null;
    student?: Student | null;
  },
): ScanCardResult {
  return {
    decision,
    message,
    method,
    value,
    student: context?.student ?? null,
    card: context?.card ?? null,
    permit: context?.permit ?? null,
    canIssuePermit: false,
    issuanceConfig: null,
    log: buildScanLog(method, value, decision, message, context),
  };
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
      "allowed",
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

export async function getScanLogs() {
  await simulateDelay(220);
  return mockScanLogs.map(cloneScanLog);
}

export async function scanCardByUid(uid: string): Promise<ScanCardResult> {
  await simulateDelay(350);

  const normalizedUid = uid.trim().toUpperCase();
  const card = await getCardByUid(normalizedUid);

  if (!card) {
    return createResult(
      "uid",
      normalizedUid,
      "card_not_registered",
      "Card not registered in the system.",
    );
  }

  if (card.status !== "active") {
    return createResult(
      "uid",
      normalizedUid,
      "card_inactive",
      `This card is ${card.status} and cannot be used for entry.`,
      { card },
    );
  }

  const student = await getStudentById(card.studentId);

  if (!student) {
    return createResult(
      "uid",
      normalizedUid,
      "denied",
      "No student record was found for this card.",
      { card },
    );
  }

  return evaluatePermitForStudent("uid", normalizedUid, student, { card });
}

export async function verifyPermitByStudentId(
  studentId: string,
): Promise<ScanCardResult> {
  await simulateDelay(300);

  const normalizedStudentId = validateStudentId(studentId);
  const student = await getStudentByStudentId(normalizedStudentId);

  if (!student) {
    return createResult(
      "student_id",
      normalizedStudentId,
      "denied",
      "No student record was found for this student ID. Please add the student in the dashboard system.",
    );
  }

  return evaluatePermitForStudent("student_id", normalizedStudentId, student);
}

export async function verifyPermit(input: {
  method: VerificationMethod;
  value: string;
}) {
  if (input.method === "uid") {
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
