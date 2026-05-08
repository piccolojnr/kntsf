import { useQuery } from "@tanstack/react-query";

import {
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
