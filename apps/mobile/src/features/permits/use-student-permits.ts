import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import { getStudentPermits } from "./permit-api";

export function useStudentPermits(studentId?: string | null) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: queryKeys.permits.student(),
    queryFn: () => getStudentPermits(),
  });
}
