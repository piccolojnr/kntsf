export type ElectionStatus = "scheduled" | "active" | "closed" | string;

export type ElectionEligibility = {
  eligible: boolean;
  reason?: string | null;
  message?: string | null;
};

export type ElectionCandidate = {
  id: string | number;
  student_id?: string | number | null;
  student_name?: string | null;
  name?: string | null;
  slogan?: string | null;
  manifesto?: string | null;
  poster_url?: string | null;
  status?: string | null;
};

export type ElectionPosition = {
  id: string | number;
  title: string;
  description?: string | null;
  has_voted?: boolean;
  voted_candidate_id?: string | number | null;
  candidates: ElectionCandidate[];
};

export type Election = {
  id: string | number;
  title: string;
  description?: string | null;
  status: ElectionStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  results_visible?: boolean;
  has_voted?: boolean;
  eligibility?: ElectionEligibility | null;
  positions?: ElectionPosition[];
};

export type VoteResponse = {
  id?: string | number;
  election_id?: string | number;
  election_position_id?: string | number;
  election_candidate_id?: string | number;
  cast_at?: string;
  message?: string;
};

export type ElectionResultCandidate = ElectionCandidate & {
  votes?: number;
  vote_count?: number;
  percentage?: number;
  is_winner?: boolean;
};

export type ElectionResultPosition = {
  id: string | number;
  title: string;
  total_votes?: number;
  candidates: ElectionResultCandidate[];
};

export type ElectionResults = {
  election?: Election;
  positions: ElectionResultPosition[];
  results_visible?: boolean;
  message?: string;
};
