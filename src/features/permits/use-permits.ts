import { useQuery } from "@tanstack/react-query";

import { getPermits } from "./permit-api";

export function usePermits() {
  return useQuery({
    queryKey: ["permits"],
    queryFn: getPermits,
  });
}
