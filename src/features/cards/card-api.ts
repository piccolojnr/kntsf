import { simulateDelay } from "@/lib/api/mock-api";

import { CardStatus, StudentCard } from "./card-types";

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

function sortCardsByRegisteredAt(left: StudentCard, right: StudentCard) {
  return (
    new Date(right.registeredAt).getTime() - new Date(left.registeredAt).getTime()
  );
}

function createMockUid(studentId: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `UID-${studentId.slice(-4)}-${suffix}`;
}

function createCardRecord(studentId: string): StudentCard {
  return {
    id: `card-${mockCards.length + 1}`,
    studentId,
    uid: createMockUid(studentId),
    type: "ntag216",
    status: "active",
    registeredAt: new Date().toISOString(),
  };
}

function getActiveCardRecord(studentId: string) {
  return mockCards.find(
    (card) => card.studentId === studentId && card.status === "active",
  );
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
    .sort(sortCardsByRegisteredAt)
    .map(cloneCard);
}

export async function getCurrentCardByStudentId(studentId: string) {
  await simulateDelay(140);

  const cards = mockCards
    .filter((item) => item.studentId === studentId)
    .sort(sortCardsByRegisteredAt);

  return cards[0] ? cloneCard(cards[0]) : null;
}

async function updateActiveCardStatus(studentId: string, status: CardStatus) {
  const activeCard = getActiveCardRecord(studentId);

  if (activeCard) {
    activeCard.status = status;
  }

  return activeCard;
}

export async function registerCardForStudent(studentId: string) {
  await simulateDelay(260);

  await updateActiveCardStatus(studentId, "revoked");
  const nextCard = createCardRecord(studentId);
  mockCards.unshift(nextCard);

  return cloneCard(nextCard);
}

export async function replaceCardForStudent(studentId: string) {
  await simulateDelay(260);

  await updateActiveCardStatus(studentId, "replaced");
  const nextCard = createCardRecord(studentId);
  mockCards.unshift(nextCard);

  return cloneCard(nextCard);
}

export async function revokeCardForStudent(studentId: string) {
  await simulateDelay(220);

  const activeCard = await updateActiveCardStatus(studentId, "revoked");

  if (!activeCard) {
    throw new Error("No active card is available to revoke.");
  }

  return cloneCard(activeCard);
}
