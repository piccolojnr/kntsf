import { useQuery } from "@tanstack/react-query";

import { getCards, getCardsPage, OperationsCardListParams } from "./card-api";

export function useCards(params?: OperationsCardListParams) {
  return useQuery({
    queryKey: ["cards", params],
    queryFn: () => getCards(params),
  });
}

export function useCardsPage(params?: OperationsCardListParams) {
  return useQuery({
    queryKey: ["cards-page", params],
    queryFn: () => getCardsPage(params),
  });
}
