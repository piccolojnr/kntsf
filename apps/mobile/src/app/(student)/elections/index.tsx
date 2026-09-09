import { Href, router } from "expo-router";
import { BarChart3, CalendarClock, CheckCircle2, Vote } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useElections } from "@/features/elections/election-hooks";
import { Election } from "@/features/elections/election-types";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function formatDate(date?: string | null) {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status: string) {
  if (status === "active") return colors.success;
  if (status === "scheduled") return colors.primary;
  if (status === "closed") return colors.textMuted;
  return colors.warning;
}

function statusRank(status: string) {
  if (status === "active") return 0;
  if (status === "scheduled") return 1;
  return 2;
}

function visibleElection(election: Election) {
  return election.status !== "closed" || Boolean(election.results_visible);
}

function ElectionCard({ election }: { election: Election }) {
  const statusColor = getStatusColor(election.status);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/(student)/elections/${election.id}` as Href)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {election.status.toUpperCase()}
          </Text>
        </View>
        {election.has_voted ? (
          <View style={styles.votedBadge}>
            <CheckCircle2 color={colors.success} size={13} />
            <Text style={styles.votedText}>Voted</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.cardTitle}>{election.title}</Text>
      {election.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {election.description}
        </Text>
      ) : null}
      <Text style={styles.window}>
        {formatDate(election.starts_at)} - {formatDate(election.ends_at)}
      </Text>

      <View style={styles.cardActions}>
        <Text style={styles.actionText}>Open election</Text>
        {election.results_visible ? (
          <BarChart3 color={colors.primary} size={16} />
        ) : (
          <Vote color={colors.primary} size={16} />
        )}
      </View>
    </Pressable>
  );
}

export default function ElectionsScreen() {
  const electionsQuery = useElections();
  const elections = (electionsQuery.data ?? [])
    .filter(visibleElection)
    .sort((left, right) => statusRank(left.status) - statusRank(right.status));
  const refreshControl = usePullToRefresh(async () => {
    await electionsQuery.refetch();
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
          eyebrow="Student"
          onBack={() => router.back()}
          subtitle="View active elections, candidates, voting status, and visible results."
          title="Elections"
        />

        {electionsQuery.isLoading ? (
          <LoadingState message="Loading elections..." />
        ) : electionsQuery.isError ? (
          <EmptyState
            description="Elections could not be loaded right now."
            icon={CalendarClock}
            title="Unable to load elections"
          />
        ) : elections.length === 0 ? (
          <SectionCard>
            <EmptyState
              description="There are no active, scheduled, or result-visible elections."
              icon={Vote}
              title="No elections"
            />
          </SectionCard>
        ) : (
          <>
            {elections.map((election) => (
              <ElectionCard key={String(election.id)} election={election} />
            ))}
            <Button
              icon={BarChart3}
              label="Refresh Elections"
              onPress={() => electionsQuery.refetch()}
              variant="secondary"
            />
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
  },
  votedBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  votedText: {
    color: colors.success,
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "900",
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  window: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  cardActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
});
