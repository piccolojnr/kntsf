import { simulateDelay } from "@/lib/api/mock-api";

import { Permit, PermitIssuanceConfig } from "./permit-types";

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

const mockPermitIssuanceConfig: PermitIssuanceConfig = {
  enabled: true,
  defaultAmount: 850,
  expiryDate: "2026-12-31T23:59:59.000Z",
  academicYear: "2025/2026",
};

function clonePermit(permit: Permit) {
  return { ...permit };
}

function clonePermitIssuanceConfig() {
  return { ...mockPermitIssuanceConfig };
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

export async function getPermitIssuanceConfig() {
  await simulateDelay(180);
  return clonePermitIssuanceConfig();
}

function createPermitCode(studentId: string, academicYear: string) {
  const suffix = studentId.split("-").at(-1)?.toUpperCase() ?? "STD";
  const year = academicYear.split("/")[1] ?? "2026";
  return `PRM-${suffix}-${year}`;
}

export async function issuePermitForStudent(studentId: string) {
  await simulateDelay(320);

  const config = clonePermitIssuanceConfig();

  if (!config.enabled) {
    throw new Error("Permit issuance is currently closed.");
  }

  const nextPermit: Permit = {
    id: `permit-${mockPermits.length + 1}`,
    studentId,
    permitCode: createPermitCode(studentId, config.academicYear),
    status: "active",
    startDate: new Date().toISOString(),
    expiryDate: config.expiryDate,
    amountPaid: config.defaultAmount,
  };

  mockPermits.unshift(nextPermit);

  return clonePermit(nextPermit);
}
