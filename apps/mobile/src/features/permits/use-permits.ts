import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import {
  getPermits,
  getPermitsPage,
  OperationsPermitListParams,
} from "./permit-api";

export function usePermits(params?: OperationsPermitListParams) {
  return useQuery({
    queryKey: queryKeys.operations.permits(params),
    queryFn: () => getPermits(params),
  });
}

export function usePermitsPage(params?: OperationsPermitListParams) {
  return useQuery({
    queryKey: [...queryKeys.operations.permits(params), "page"] as const,
    queryFn: () => getPermitsPage(params),
  });
}
