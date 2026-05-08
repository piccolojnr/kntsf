import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";

import { getStudentProfile } from "./student-api";

export function useCurrentStudent() {
  const { user } = useAuth();
  const studentQuery = useQuery({
    enabled: Boolean(user && user.role === "student"),
    queryKey: ["student-profile", user?.id, user?.studentId],
    queryFn: () => (user ? getStudentProfile() : null),
  });

  return {
    ...studentQuery,
    student: studentQuery.data ?? null,
  };
}
