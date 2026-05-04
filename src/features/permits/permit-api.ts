import { simulateDelay } from "@/lib/api/mock-api";

import { Permit } from "./permit-types";

const mockPermits: Permit[] = [
  {
    id: "permit-1",
    studentId: "student-1",
    permitCode: "PRM-AMA-2026",
    status: "active",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
  {
    id: "permit-2",
    studentId: "student-2",
    permitCode: "PRM-KWE-2025",
    status: "expired",
    startDate: "2025-01-01T00:00:00.000Z",
    expiryDate: "2025-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
  {
    id: "permit-3",
    studentId: "student-3",
    permitCode: "PRM-EFU-2026",
    status: "active",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
  {
    id: "permit-4",
    studentId: "student-4",
    permitCode: "PRM-KOJ-2026",
    status: "revoked",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
    amountPaid: 850,
  },
];

function clonePermit(permit: Permit) {
  return { ...permit };
}

export async function getPermits() {
  await simulateDelay(250);
  return mockPermits.map(clonePermit);
}

export async function getPermitById(id: string) {
  await simulateDelay(180);

  const permit = mockPermits.find((item) => item.id === id);

  return permit ? clonePermit(permit) : null;
}

export async function getPermitsByStudentId(studentId: string) {
  await simulateDelay(180);

  return mockPermits
    .filter((item) => item.studentId === studentId)
    .map(clonePermit);
}

export async function getLatestPermitByStudentId(studentId: string) {
  const permits = await getPermitsByStudentId(studentId);

  return permits.sort((left, right) => {
    return (
      new Date(right.startDate).getTime() - new Date(left.startDate).getTime()
    );
  })[0] ?? null;
}
