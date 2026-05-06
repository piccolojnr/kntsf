import { useMemo } from "react";

import { useAuth } from "@/hooks/use-auth";

import { useStudents } from "./use-students";

export function useCurrentStudent() {
  const { user } = useAuth();
  const studentsQuery = useStudents();

  const student = useMemo(() => {
    const students = studentsQuery.data ?? [];

    if (!user || user.role !== "student") {
      return null;
    }

    return (
      students.find((item) => item.id === user.id) ??
      students.find((item) => item.studentId === user.studentId) ??
      students.find(
        (item) => item.email.toLowerCase() === user.email.toLowerCase(),
      ) ??
      null
    );
  }, [studentsQuery.data, user]);

  return {
    ...studentsQuery,
    student,
  };
}
