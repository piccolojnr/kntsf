import { getCardByUid } from "@/features/cards/card-api";
import { StudentCard } from "@/features/cards/card-types";
import {
  getLatestPermitByStudentId,
  getPermitsByStudentId,
} from "@/features/permits/permit-api";
import { Permit } from "@/features/permits/permit-types";
import { getStudentById } from "@/features/students/student-api";
import { Student } from "@/features/students/student-types";
import { simulateDelay } from "@/lib/api/mock-api";

import { ScanCardResult, ScanDecision, ScanLog } from "./scan-types";

const mockScanLogs: ScanLog[] = [
  {
    id: "scan-log-1",
    uid: "UID-AMA-001",
    scannedAt: "2026-05-03T08:30:00.000Z",
    decision: "allowed",
    message: "Active permit verified. Access granted.",
    studentId: "student-1",
    cardId: "card-1",
    permitId: "permit-1",
  },
  {
    id: "scan-log-2",
    uid: "UID-EFUA-003",
    scannedAt: "2026-05-03T10:10:00.000Z",
    decision: "card_inactive",
    message: "This card is not active for scanning.",
    studentId: "student-3",
    cardId: "card-3",
  },
  {
    id: "scan-log-3",
    uid: "UID-UNKNOWN-999",
    scannedAt: "2026-05-03T12:45:00.000Z",
    decision: "card_not_registered",
    message: "Card not registered in the system.",
  },
];

function cloneScanLog(log: ScanLog) {
  return { ...log };
}

function buildScanLog(
  uid: string,
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
    uid,
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
  decision: ScanDecision,
  message: string,
  uid: string,
  context?: {
    card?: StudentCard | null;
    permit?: Permit | null;
    student?: Student | null;
  },
): ScanCardResult {
  return {
    decision,
    message,
    student: context?.student ?? null,
    card: context?.card ?? null,
    permit: context?.permit ?? null,
    log: buildScanLog(uid, decision, message, context),
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
      "card_not_registered",
      "Card not registered in the system.",
      normalizedUid,
    );
  }

  if (card.status !== "active") {
    return createResult(
      "card_inactive",
      `This card is ${card.status} and cannot be used for entry.`,
      normalizedUid,
      { card },
    );
  }

  const student = await getStudentById(card.studentId);

  if (!student) {
    return createResult(
      "denied",
      "No student record was found for this card.",
      normalizedUid,
      { card },
    );
  }

  const permits = await getPermitsByStudentId(student.id);
  const activePermit = permits.find((permit) => permit.status === "active");

  if (activePermit) {
    return createResult(
      "allowed",
      "Active permit verified. Access granted.",
      normalizedUid,
      {
        card,
        permit: activePermit,
        student,
      },
    );
  }

  const latestPermit = await getLatestPermitByStudentId(student.id);

  if (latestPermit?.status === "expired") {
    return createResult(
      "expired_permit",
      "The student's latest permit has expired.",
      normalizedUid,
      {
        card,
        permit: latestPermit,
        student,
      },
    );
  }

  return createResult(
    "no_active_permit",
    "Student found, but there is no active permit for entry.",
    normalizedUid,
    {
      card,
      permit: latestPermit,
      student,
    },
  );
}
