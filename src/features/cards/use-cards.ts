import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import { getCards, getCardsPage, OperationsCardListParams } from "./card-api";

export function useCards(params?: OperationsCardListParams) {
  return useQuery({
    queryKey: queryKeys.operations.cards(params),
    queryFn: () => getCards(params),
  });
}

export function useCardsPage(params?: OperationsCardListParams) {
  return useQuery({
    queryKey: [...queryKeys.operations.cards(params), "page"] as const,
    queryFn: () => getCardsPage(params),
  });
}
