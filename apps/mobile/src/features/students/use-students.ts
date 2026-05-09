import { useQuery } from "@tanstack/react-query";

import {
  getStudentByStudentId,
  getStudents,
  getStudentsPage,
  OperationsListParams,
} from "./student-api";

export function useStudents(params?: OperationsListParams) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
  });
}

export function useStudentsPage(params?: OperationsListParams) {
  return useQuery({
    queryKey: ["students-page", params],
    queryFn: () => getStudentsPage(params),
  });
}

export function useStudentByStudentId(studentId?: string | null) {
  return useQuery({
    enabled: Boolean(studentId?.trim()),
    queryKey: ["student", "student-id", studentId],
    queryFn: () => getStudentByStudentId(studentId ?? ""),
  });
}
