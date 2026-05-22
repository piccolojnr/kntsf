import { router } from "expo-router";
import { UserRound, UsersRound } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useExecutives } from "@/features/content/content-hooks";
import { Executive } from "@/features/content/content-types";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function cleanText(value?: string | null) {
  return (value ?? "").replace(/<[^>]*>/g, "").trim();
}

function ExecutiveCard({ executive }: { executive: Executive }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        {executive.avatar_url ? (
          <Image source={{ uri: executive.avatar_url }} style={styles.avatar} />
        ) : (
          <UserRound color={colors.textMuted} size={28} />
        )}
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{executive.name}</Text>
        <Text style={styles.position}>{executive.position}</Text>
        {executive.biography ? (
          <Text style={styles.bio} numberOfLines={4}>
            {cleanText(executive.biography)}
          </Text>
        ) : null}
        {executive.email || executive.phone ? (
          <Text style={styles.contact}>
            {[executive.email, executive.phone].filter(Boolean).join(" • ")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ExecutivesScreen() {
  const executivesQuery = useExecutives({ per_page: 25 });
  const executives = executivesQuery.data?.items ?? [];
  const refreshControl = usePullToRefresh(async () => {
    await executivesQuery.refetch();
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
          eyebrow="Content"
          onBack={() => router.back()}
          subtitle="Published SRC executive profiles."
          title="Executives"
        />

        {executivesQuery.isLoading ? (
          <LoadingState message="Loading executives..." />
        ) : executivesQuery.isError ? (
          <EmptyState
            description="Executives could not be loaded right now."
            icon={UsersRound}
            title="Unable to load executives"
          />
        ) : executives.length === 0 ? (
          <EmptyState
            description="No executive profiles are currently published."
            icon={UsersRound}
            title="No executives"
          />
        ) : (
          executives.map((executive) => (
            <ExecutiveCard key={String(executive.id)} executive={executive} />
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
  card: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatarWrap: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    height: 72,
    justifyContent: "center",
    overflow: "hidden",
    width: 72,
  },
  avatar: {
    height: "100%",
    width: "100%",
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "900",
  },
  position: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  bio: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  contact: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
});
