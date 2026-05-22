import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import { getOperationsSummary } from "./operations-summary-api";

export function useOperationsSummary() {
  return useQuery({
    queryKey: queryKeys.operations.summary(),
    queryFn: getOperationsSummary,
  });
}
