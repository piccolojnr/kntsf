import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import {
  castElectionVote,
  getElection,
  getElectionResults,
  getElections,
} from "./election-api";

export function useElections() {
  return useQuery({
    queryKey: queryKeys.elections.lists(),
    queryFn: getElections,
  });
}

export function useElection(id?: string | number | null) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: queryKeys.elections.detail(id ?? ""),
    queryFn: () => getElection(id ?? ""),
  });
}

export function useElectionResults(id?: string | number | null) {
  return useQuery({
    enabled: Boolean(id),
    retry: false,
    queryKey: queryKeys.elections.results(id ?? ""),
    queryFn: () => getElectionResults(id ?? ""),
  });
}

export function useCastElectionVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: castElectionVote,
    onSuccess: async (_vote, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.elections.lists() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.elections.detail(input.electionId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.elections.results(input.electionId),
        }),
      ]);
    },
  });
}
