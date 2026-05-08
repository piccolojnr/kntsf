import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { ApiListResponse } from "@/lib/api/api-types";

import { CardStatus, StudentCard, StudentCardDto } from "./card-types";

export type CardAssignmentMode = "register" | "replace";

type MobileApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type OperationsCardListParams = {
  search?: string;
  status?: CardStatus | "all";
  page?: number;
  limit?: number;
};

export type CardsListResult = ApiListResponse<StudentCard>;

type CardMutationResponse =
  | StudentCardDto
  | {
      card: StudentCardDto;
      reason?: string;
    };

function normalizeCard(dto: StudentCardDto): StudentCard {
  const uidLast4 = dto.uidLast4 ?? dto.uid_last4;

  return {
    id: String(dto.id),
    studentId: String(dto.studentId ?? dto.student_id ?? dto.student?.studentId ?? ""),
    uid: dto.uid ?? (uidLast4 ? `.... ${uidLast4}` : ""),
    type: dto.type ?? "unknown",
    status: dto.status ?? "inactive",
    registeredAt:
      dto.registeredAt ??
      dto.registered_at ??
      dto.activatedAt ??
      dto.issuedAt ??
      dto.createdAt ??
      "",
    uidLast4,
    student: dto.student ?? null,
  };
}

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

function unwrapCardMutationResponse(data: CardMutationResponse) {
  return "card" in data ? data.card : data;
}

function sortCardsByRegisteredAt(left: StudentCard, right: StudentCard) {
  return (
    new Date(right.registeredAt).getTime() - new Date(left.registeredAt).getTime()
  );
}

export async function getCards(params?: OperationsCardListParams) {
  try {
    const response = await apiClient.get<
      MobileApiResponse<ApiListResponse<StudentCardDto>>
    >("/api/mobile/operations/cards", {
      params: {
        search: params?.search,
        status: params?.status === "all" ? undefined : params?.status,
        page: params?.page,
        limit: params?.limit,
      },
    });

    const data = getMobileData(response.data);

    return data.items.map(normalizeCard);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getCardsPage(
  params?: OperationsCardListParams,
): Promise<CardsListResult> {
  try {
    const response = await apiClient.get<
      MobileApiResponse<ApiListResponse<StudentCardDto>>
    >("/api/mobile/operations/cards", {
      params: {
        search: params?.search,
        status: params?.status === "all" ? undefined : params?.status,
        page: params?.page,
        limit: params?.limit,
      },
    });
    const data = getMobileData(response.data);

    return {
      items: data.items.map(normalizeCard),
      pagination: data.pagination,
    };
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getCardById(id: string) {
  const cards = await getCards({ page: 1, limit: 100 });
  return cards.find((card) => card.id === id) ?? null;
}

export async function getCardByUid(uid: string) {
  const normalizedUid = uid.trim().toUpperCase();
  const cards = await getCards({
    search: normalizedUid.slice(-4),
    page: 1,
    limit: 20,
  });

  return (
    cards.find(
      (card) =>
        card.uid.toUpperCase() === normalizedUid ||
        card.uidLast4?.toUpperCase() === normalizedUid.slice(-4),
    ) ?? null
  );
}

export async function getCardsByStudentId(studentId: string) {
  const cards = await getCards({ search: studentId, page: 1, limit: 100 });

  return cards
    .filter(
      (card) =>
        card.studentId === studentId || card.student?.studentId === studentId,
    )
    .sort(sortCardsByRegisteredAt);
}

export async function getCurrentCardByStudentId(studentId: string) {
  const cards = await getCardsByStudentId(studentId);

  return (
    cards.find((card) => card.status === "active") ?? cards[0] ?? null
  );
}

export async function registerCardForStudent(studentId: string, uid: string) {
  try {
    const response = await apiClient.post<MobileApiResponse<CardMutationResponse>>(
      "/api/mobile/cards/register",
      { studentId, uid },
    );

    return normalizeCard(unwrapCardMutationResponse(getMobileData(response.data)));
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function replaceCardForStudent(studentId: string, uid: string) {
  try {
    const response = await apiClient.post<MobileApiResponse<CardMutationResponse>>(
      "/api/mobile/cards/replace",
      { studentId, uid },
    );

    return normalizeCard(unwrapCardMutationResponse(getMobileData(response.data)));
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function assignCardToStudent(input: {
  mode: CardAssignmentMode;
  studentId: string;
  uid: string;
}) {
  const normalizedUid = input.uid.trim().toUpperCase();

  if (!normalizedUid) {
    throw new Error("A scanned card UID is required before assigning a card.");
  }

  return input.mode === "register"
    ? registerCardForStudent(input.studentId, normalizedUid)
    : replaceCardForStudent(input.studentId, normalizedUid);
}

export async function revokeCardForStudent(cardId: string) {
  try {
    const response = await apiClient.post<MobileApiResponse<CardMutationResponse>>(
      "/api/mobile/cards/revoke",
      { cardId: Number(cardId) },
    );

    return normalizeCard(unwrapCardMutationResponse(getMobileData(response.data)));
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function reportLostCardForStudent(_studentId: string) {
  try {
    const response = await apiClient.post<
      MobileApiResponse<CardMutationResponse | { card: StudentCardDto | null }>
    >("/api/mobile/student/card/report-lost");
    const data = getMobileData(response.data);

    if (!data || ("card" in data && !data.card)) {
      return null;
    }

    return normalizeCard(unwrapCardMutationResponse(data as CardMutationResponse));
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getStudentCard(_studentId?: string) {
  try {
    const response = await apiClient.get<
      MobileApiResponse<StudentCardDto | { card: StudentCardDto | null } | null>
    >("/api/mobile/student/card");
    const data = getMobileData(response.data);
    const card = data && "card" in data ? data.card : data;

    return card ? normalizeCard(card) : null;
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.statusCode === 404) {
      return null;
    }

    throw toUserFacingError(error);
  }
}
