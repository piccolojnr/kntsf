import { useQuery } from "@tanstack/react-query";

import { getCards, OperationsCardListParams } from "./card-api";

export function useCards(params?: OperationsCardListParams) {
  return useQuery({
    queryKey: ["cards", params],
    queryFn: () => getCards(params),
  });
}
