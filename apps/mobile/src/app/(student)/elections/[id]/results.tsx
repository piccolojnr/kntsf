import { router, useLocalSearchParams } from "expo-router";
import { BarChart3, LockKeyhole, Trophy } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useElectionResults } from "@/features/elections/election-hooks";
import { ElectionResultCandidate } from "@/features/elections/election-types";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getCandidateName(candidate: ElectionResultCandidate) {
  return candidate.student_name ?? candidate.name ?? "Candidate";
}

function getVotes(candidate: ElectionResultCandidate) {
  return candidate.votes ?? candidate.vote_count ?? 0;
}

export default function ElectionResultsScreen() {
  const params = useLocalSearchParams();
  const electionId = firstParam(params.id) ?? "";
  const resultsQuery = useElectionResults(electionId);
  const results = resultsQuery.data;
  const refreshControl = usePullToRefresh(async () => {
    await resultsQuery.refetch();
  });

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
          subtitle="Visible results are provided by the backend."
          title="Results"
        />

        {resultsQuery.isLoading ? (
          <LoadingState message="Loading results..." />
        ) : resultsQuery.isError ? (
          <EmptyState
            description={
              resultsQuery.error instanceof Error
                ? resultsQuery.error.message
                : "Results are not visible or could not be loaded."
            }
            icon={LockKeyhole}
            title="Results unavailable"
          />
        ) : !results || results.positions.length === 0 ? (
          <EmptyState
            description={results?.message ?? "No result data is available yet."}
            icon={BarChart3}
            title="No results"
          />
        ) : (
          results.positions.map((position) => (
            <SectionCard key={String(position.id)} title={position.title}>
              <Text style={styles.total}>
                Total votes: {position.total_votes ?? 0}
              </Text>
              {position.candidates.map((candidate) => (
                <View key={String(candidate.id)} style={styles.resultRow}>
                  <View style={styles.resultCopy}>
                    <Text style={styles.candidateName}>
                      {getCandidateName(candidate)}
                    </Text>
                    <Text style={styles.voteCount}>
                      {getVotes(candidate)} vote
                      {getVotes(candidate) === 1 ? "" : "s"}
                      {candidate.percentage != null
                        ? ` • ${candidate.percentage}%`
                        : ""}
                    </Text>
                  </View>
                  {candidate.is_winner ? (
                    <View style={styles.winnerBadge}>
                      <Trophy color={colors.success} size={14} />
                      <Text style={styles.winnerText}>Winner</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </SectionCard>
          ))
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
  total: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  resultRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  resultCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  candidateName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "900",
  },
  voteCount: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  winnerBadge: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  winnerText: {
    color: colors.success,
    fontSize: fontSizes.xs,
    fontWeight: "900",
  },
});
