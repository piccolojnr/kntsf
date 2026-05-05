import { useQuery } from "@tanstack/react-query";

import { getCards } from "./card-api";

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: getCards,
  });
}
