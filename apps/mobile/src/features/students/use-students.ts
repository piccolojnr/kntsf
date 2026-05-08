import { useQuery } from "@tanstack/react-query";

import { getStudents, OperationsListParams } from "./student-api";

export function useStudents(params?: OperationsListParams) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
  });
}
