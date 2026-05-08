import { useQuery } from "@tanstack/react-query";

import { getPermits, OperationsPermitListParams } from "./permit-api";

export function usePermits(params?: OperationsPermitListParams) {
  return useQuery({
    queryKey: ["permits", params],
    queryFn: () => getPermits(params),
  });
}
