import { getStudentById } from "@/features/students/student-api";
import { simulateDelay } from "@/lib/api/mock-api";

import { CardStatus, StudentCard, StudentCardDto } from "./card-types";

export type CardAssignmentMode = "register" | "replace";

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

function normalizeCard(dto: StudentCardDto): StudentCard {
  return {
    id: dto.id,
    studentId: dto.studentId,
    uid: dto.uid,
    type: dto.type,
    status: dto.status,
    registeredAt: dto.registeredAt,
  };
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

function getConflictingActiveCard(studentId: string, uid: string) {
  const normalizedUid = uid.trim().toUpperCase();

  return mockCards.find(
    (card) =>
      card.studentId !== studentId &&
      card.status === "active" &&
      card.uid.toUpperCase() === normalizedUid,
  );
}

export async function getCards() {
  // TODO(real-api): replace mockCards with apiClient.get("/api/mobile/cards").
  await simulateDelay(250);
  return mockCards.map(cloneCard).map(normalizeCard);
}

export async function getCardById(id: string) {
  // TODO(real-api): replace lookup with apiClient.get(`/api/mobile/cards/${id}`).
  await simulateDelay(180);

  const card = mockCards.find((item) => item.id === id);

  return card ? normalizeCard(cloneCard(card)) : null;
}

export async function getCardByUid(uid: string) {
  // TODO(real-api): replace lookup with backend card UID endpoint.
  await simulateDelay(180);

  const normalizedUid = uid.trim().toUpperCase();
  const card = mockCards.find((item) => item.uid.toUpperCase() === normalizedUid);

  return card ? normalizeCard(cloneCard(card)) : null;
}

export async function getCardsByStudentId(studentId: string) {
  // TODO(real-api): replace lookup with backend student cards endpoint.
  await simulateDelay(180);

  return mockCards
    .filter((item) => item.studentId === studentId)
    .sort(sortCardsByRegisteredAt)
    .map(cloneCard)
    .map(normalizeCard);
}

export async function getCurrentCardByStudentId(studentId: string) {
  // TODO(real-api): replace lookup with backend current student card endpoint.
  await simulateDelay(140);

  const cards = mockCards
    .filter((item) => item.studentId === studentId)
    .sort(sortCardsByRegisteredAt);

  return cards[0] ? normalizeCard(cloneCard(cards[0])) : null;
}

async function updateActiveCardStatus(studentId: string, status: CardStatus) {
  const activeCard = getActiveCardRecord(studentId);

  if (activeCard) {
    activeCard.status = status;
  }

  return activeCard;
}

export async function registerCardForStudent(studentId: string) {
  // TODO(real-api): replace mock mutation with POST /api/mobile/cards/register.
  await simulateDelay(260);

  await updateActiveCardStatus(studentId, "revoked");
  const nextCard = createCardRecord(studentId);
  mockCards.unshift(nextCard);

  return normalizeCard(cloneCard(nextCard));
}

export async function replaceCardForStudent(studentId: string) {
  // TODO(real-api): replace mock mutation with POST /api/mobile/cards/replace.
  await simulateDelay(260);

  await updateActiveCardStatus(studentId, "replaced");
  const nextCard = createCardRecord(studentId);
  mockCards.unshift(nextCard);

  return normalizeCard(cloneCard(nextCard));
}

export async function assignCardToStudent(input: {
  mode: CardAssignmentMode;
  studentId: string;
  uid: string;
}) {
  // TODO(real-api): replace mock assignment with backend card assignment endpoint.
  await simulateDelay(220);
  const normalizedUid = input.uid.trim().toUpperCase();

  if (!normalizedUid) {
    throw new Error("Enter a card UID before assigning a card.");
  }

  const conflictingCard = getConflictingActiveCard(input.studentId, normalizedUid);

  if (conflictingCard) {
    const assignedStudent = await getStudentById(conflictingCard.studentId);
    const assignedName = assignedStudent?.name ?? "another student";

    throw new Error(
      `This card is already assigned to ${assignedName}. If you need to move this card, revoke it from that student first and then try again.`,
    );
  }

  const modeAction =
    input.mode === "register" ? registerCardForStudent : replaceCardForStudent;

  const nextCard = await modeAction(input.studentId);
  const cardRecord = mockCards.find((card) => card.id === nextCard.id);

  if (!cardRecord) {
    throw new Error("The new card record could not be created.");
  }

  cardRecord.uid = normalizedUid;

  return normalizeCard(cloneCard(cardRecord));
}

export async function revokeCardForStudent(studentId: string) {
  // TODO(real-api): replace mock mutation with POST /api/mobile/cards/revoke.
  await simulateDelay(220);

  const activeCard = await updateActiveCardStatus(studentId, "revoked");

  if (!activeCard) {
    throw new Error("No active card is available to revoke.");
  }

  return normalizeCard(cloneCard(activeCard));
}

export async function reportLostCardForStudent(studentId: string) {
  // TODO(real-api): replace mock mutation with backend lost card endpoint.
  await simulateDelay(220);

  const activeCard = await updateActiveCardStatus(studentId, "lost");

  if (!activeCard) {
    throw new Error("No active card is available to report as lost.");
  }

  return normalizeCard(cloneCard(activeCard));
}
