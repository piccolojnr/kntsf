import { useQuery } from "@tanstack/react-query";

import { getStudentCard } from "./card-api";

export function useStudentCard(studentId?: string | null) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: ["student-card", studentId],
    queryFn: () => getStudentCard(studentId ?? undefined),
  });
}
