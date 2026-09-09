import { useQuery } from "@tanstack/react-query";

import { isStudent } from "@/features/auth/auth-permissions";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/api/query-keys";

import { getStudentProfile } from "./student-api";

export function useCurrentStudent() {
  const { user } = useAuth();
  const studentQuery = useQuery({
    enabled: isStudent(user),
    queryKey: queryKeys.student.profile(),
    queryFn: () => (user ? getStudentProfile() : null),
  });

  return {
    ...studentQuery,
    student: studentQuery.data ?? null,
  };
}
