import { simulateDelay } from "@/lib/api/mock-api";

import { StudentCard } from "./card-types";

const mockCards: StudentCard[] = [
  {
    id: "card-1",
    studentId: "student-1",
    uid: "UID-AMA-001",
    type: "ntag216",
    status: "active",
    registeredAt: "2026-01-10T09:15:00.000Z",
  },
  {
    id: "card-2",
    studentId: "student-2",
    uid: "UID-KWESI-002",
    type: "mifare_classic",
    status: "active",
    registeredAt: "2026-01-12T11:00:00.000Z",
  },
  {
    id: "card-3",
    studentId: "student-3",
    uid: "UID-EFUA-003",
    type: "ntag216",
    status: "revoked",
    registeredAt: "2026-01-14T08:00:00.000Z",
  },
  {
    id: "card-4",
    studentId: "student-4",
    uid: "UID-KOJO-004",
    type: "unknown",
    status: "active",
    registeredAt: "2026-01-15T13:30:00.000Z",
  },
  {
    id: "card-5",
    studentId: "student-5",
    uid: "UID-ABENA-005",
    type: "ntag216",
    status: "blocked",
    registeredAt: "2026-01-16T10:45:00.000Z",
  },
  {
    id: "card-6",
    studentId: "student-1",
    uid: "UID-AMA-OLD",
    type: "mifare_classic",
    status: "replaced",
    registeredAt: "2025-09-02T08:00:00.000Z",
  },
];

function cloneCard(card: StudentCard) {
  return { ...card };
}

export async function getCards() {
  await simulateDelay(250);
  return mockCards.map(cloneCard);
}

export async function getCardById(id: string) {
  await simulateDelay(180);

  const card = mockCards.find((item) => item.id === id);

  return card ? cloneCard(card) : null;
}

export async function getCardByUid(uid: string) {
  await simulateDelay(180);

  const normalizedUid = uid.trim().toUpperCase();
  const card = mockCards.find((item) => item.uid.toUpperCase() === normalizedUid);

  return card ? cloneCard(card) : null;
}

export async function getCardsByStudentId(studentId: string) {
  await simulateDelay(180);

  return mockCards
    .filter((item) => item.studentId === studentId)
    .map(cloneCard);
}
