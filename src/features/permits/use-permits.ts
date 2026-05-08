import { useQuery } from "@tanstack/react-query";

import {
  getPermits,
  getPermitsPage,
  OperationsPermitListParams,
} from "./permit-api";

export function usePermits(params?: OperationsPermitListParams) {
  return useQuery({
    queryKey: ["permits", params],
    queryFn: () => getPermits(params),
  });
}

export function usePermitsPage(params?: OperationsPermitListParams) {
  return useQuery({
    queryKey: ["permits-page", params],
    queryFn: () => getPermitsPage(params),
  });
}
