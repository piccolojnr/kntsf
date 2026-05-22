import { Href, router, useLocalSearchParams } from "expo-router";
import { AlertCircle, BarChart3, CheckCircle2, ShieldAlert, Vote } from "lucide-react-native";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  useCastElectionVote,
  useElection,
} from "@/features/elections/election-hooks";
import {
  ElectionCandidate,
  ElectionPosition,
} from "@/features/elections/election-types";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date?: string | null) {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCandidateName(candidate: ElectionCandidate) {
  return candidate.student_name ?? candidate.name ?? "Candidate";
}

function CandidateCard({
  candidate,
  disabled,
  onVote,
  voted,
}: {
  candidate: ElectionCandidate;
  disabled: boolean;
  onVote: () => void;
  voted: boolean;
}) {
  return (
    <View style={styles.candidateCard}>
      {candidate.poster_url ? (
        <Image source={{ uri: candidate.poster_url }} style={styles.poster} />
      ) : null}
      <View style={styles.candidateBody}>
        <Text style={styles.candidateName}>{getCandidateName(candidate)}</Text>
        {candidate.slogan ? (
          <Text style={styles.slogan}>{candidate.slogan}</Text>
        ) : null}
        {candidate.manifesto ? (
          <Text style={styles.manifesto} numberOfLines={4}>
            {candidate.manifesto}
          </Text>
        ) : null}
        {voted ? (
          <View style={styles.alreadyVoted}>
            <CheckCircle2 color={colors.success} size={16} />
            <Text style={styles.alreadyVotedText}>Vote recorded</Text>
          </View>
        ) : (
          <Button
            disabled={disabled}
            icon={Vote}
            label="Vote"
            onPress={onVote}
            size="compact"
          />
        )}
      </View>
    </View>
  );
}

function PositionSection({
  electionId,
  eligible,
  isActive,
  position,
}: {
  electionId: string;
  eligible: boolean;
  isActive: boolean;
  position: ElectionPosition;
}) {
  const voteMutation = useCastElectionVote();
  const approvedCandidates = position.candidates.filter(
    (candidate) => !candidate.status || candidate.status === "approved",
  );
  const hasVoted = Boolean(position.has_voted);
  const canVote = eligible && isActive && !hasVoted;

  function confirmVote(candidate: ElectionCandidate) {
    Alert.alert(
      "Confirm Vote",
      `Vote for ${getCandidateName(candidate)} as ${position.title}? This cannot be changed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Cast Vote",
          style: "destructive",
          onPress: () =>
            voteMutation.mutate({
              electionId,
              positionId: position.id,
              candidateId: candidate.id,
            }),
        },
      ],
    );
  }

  return (
    <SectionCard title={position.title}>
      {position.description ? (
        <Text style={styles.description}>{position.description}</Text>
      ) : null}
      {hasVoted ? (
        <Text style={styles.muted}>You have already voted for this position.</Text>
      ) : null}
      {approvedCandidates.length === 0 ? (
        <Text style={styles.muted}>No approved candidates are available.</Text>
      ) : (
        approvedCandidates.map((candidate) => (
          <CandidateCard
            key={String(candidate.id)}
            candidate={candidate}
            disabled={!canVote || voteMutation.isPending}
            onVote={() => confirmVote(candidate)}
            voted={String(position.voted_candidate_id) === String(candidate.id)}
          />
        ))
      )}
      {voteMutation.isError ? (
        <Text style={styles.error}>
          {voteMutation.error instanceof Error
            ? voteMutation.error.message
            : "Unable to cast vote."}
        </Text>
      ) : null}
    </SectionCard>
  );
}

export default function ElectionDetailScreen() {
  const params = useLocalSearchParams();
  const electionId = firstParam(params.id) ?? "";
  const electionQuery = useElection(electionId);
  const election = electionQuery.data;
  const refreshControl = usePullToRefresh(async () => {
    await electionQuery.refetch();
  });
  const eligible = Boolean(election?.eligibility?.eligible);
  const isActive = election?.status === "active";
  const eligibilityMessage =
    election?.eligibility?.message ??
    election?.eligibility?.reason ??
    "The backend will confirm final eligibility when you vote.";

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Election"
          onBack={() => router.back()}
          subtitle={
            election
              ? `${formatDate(election.starts_at)} - ${formatDate(election.ends_at)}`
              : "Election details"
          }
          title={election?.title ?? "Election"}
        />

        {electionQuery.isLoading ? (
          <LoadingState message="Loading election..." />
        ) : electionQuery.isError || !election ? (
          <EmptyState
            description="This election could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load election"
          />
        ) : (
          <>
            {election.description ? (
              <Text style={styles.description}>{election.description}</Text>
            ) : null}

            <SectionCard title="Eligibility">
              <View style={styles.eligibilityRow}>
                {eligible ? (
                  <CheckCircle2 color={colors.success} size={20} />
                ) : (
                  <AlertCircle color={colors.warning} size={20} />
                )}
                <View style={styles.flex}>
                  <Text
                    style={[
                      styles.eligibilityTitle,
                      { color: eligible ? colors.success : colors.warning },
                    ]}
                  >
                    {eligible ? "Eligible to vote" : "Not eligible"}
                  </Text>
                  <Text style={styles.muted}>{eligibilityMessage}</Text>
                </View>
              </View>
              {!isActive ? (
                <Text style={styles.muted}>
                  Voting is available only while the election is active.
                </Text>
              ) : null}
            </SectionCard>

            {(election.positions ?? []).map((position) => (
              <PositionSection
                key={String(position.id)}
                electionId={String(election.id)}
                eligible={eligible}
                isActive={isActive}
                position={position}
              />
            ))}

            {election.results_visible ? (
              <Button
                icon={BarChart3}
                label="View Results"
                onPress={() =>
                  router.push(`/(student)/elections/${election.id}/results` as Href)
                }
                variant="secondary"
              />
            ) : null}
          </>
        )}
      </AppRefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  muted: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  eligibilityRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  eligibilityTitle: {
    fontSize: fontSizes.md,
    fontWeight: "900",
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
  candidateCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  poster: {
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    height: 96,
    width: 72,
  },
  candidateBody: {
    flex: 1,
    gap: spacing.xs,
  },
  candidateName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "900",
  },
  slogan: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  manifesto: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  alreadyVoted: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  alreadyVotedText: {
    color: colors.success,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
});
