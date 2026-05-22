import { apiClient } from "@/lib/api/api-client";
import { toUserFacingError } from "@/lib/api/api-errors";
import { unwrapData } from "@/lib/api/api-response";

import {
  Election,
  ElectionResults,
  VoteResponse,
} from "./election-types";

type ElectionListResponse =
  | Election[]
  | { elections: Election[] }
  | { active?: Election[]; scheduled?: Election[]; closed?: Election[] };

function normalizeElectionList(data: ElectionListResponse) {
  if (Array.isArray(data)) {
    return data;
  }

  if ("elections" in data && Array.isArray(data.elections)) {
    return data.elections;
  }

  const grouped = data as {
    active?: Election[];
    scheduled?: Election[];
    closed?: Election[];
  };

  return [
    ...(grouped.active ?? []),
    ...(grouped.scheduled ?? []),
    ...(grouped.closed ?? []),
  ];
}

export async function getElections() {
  try {
    const response = await apiClient.get<
      ElectionListResponse | { data: ElectionListResponse }
    >("/api/mobile/elections");
    const data = unwrapData<ElectionListResponse>(response.data);

    return normalizeElectionList(data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getElection(id: string | number) {
  try {
    const response = await apiClient.get<Election | { data: Election }>(
      `/api/mobile/elections/${encodeURIComponent(String(id))}`,
    );

    return unwrapData<Election>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function castElectionVote(input: {
  electionId: string | number;
  positionId: string | number;
  candidateId: string | number;
}) {
  try {
    const response = await apiClient.post<VoteResponse | { data: VoteResponse }>(
      `/api/mobile/elections/${encodeURIComponent(
        String(input.electionId),
      )}/positions/${encodeURIComponent(String(input.positionId))}/vote`,
      {
        candidate_id: input.candidateId,
      },
    );

    return unwrapData<VoteResponse>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getElectionResults(id: string | number) {
  try {
    const response = await apiClient.get<
      ElectionResults | { data: ElectionResults }
    >(`/api/mobile/elections/${encodeURIComponent(String(id))}/results`);

    return unwrapData<ElectionResults>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}
