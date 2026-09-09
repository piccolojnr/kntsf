import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import { getStudentNfcCard, reportLostNfcCardForStudent } from "./card-api";

export function useStudentNfcCard(studentId?: string | null) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: queryKeys.student.card(),
    queryFn: () => getStudentNfcCard(studentId ?? undefined),
  });
}

export const useStudentCard = useStudentNfcCard;

export function useReportLostNfcCard(studentId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!studentId) {
        throw new Error("No student record linked to this account.");
      }

      return reportLostNfcCardForStudent(studentId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.student.card() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.student.profile() }),
      ]);
    },
  });
}
