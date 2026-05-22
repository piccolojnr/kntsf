import { useQuery } from "@tanstack/react-query";

import { isStudent } from "@/features/auth/auth-permissions";
import { useAuth } from "@/hooks/use-auth";

import { getStudentProfile } from "./student-api";

export function useCurrentStudent() {
  const { user } = useAuth();
  const studentQuery = useQuery({
    enabled: isStudent(user),
    queryKey: ["student-profile", user?.id, user?.studentId],
    queryFn: () => (user ? getStudentProfile() : null),
  });

  return {
    ...studentQuery,
    student: studentQuery.data ?? null,
  };
}
