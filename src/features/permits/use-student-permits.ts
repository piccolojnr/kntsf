import { useQuery } from "@tanstack/react-query";

import { getStudentPermits } from "./permit-api";

export function useStudentPermits(studentId?: string | null) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: ["student-permits", studentId],
    queryFn: () => getStudentPermits(),
  });
}
