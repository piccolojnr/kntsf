import { useQuery } from "@tanstack/react-query";

import { getStudents } from "./student-api";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });
}
