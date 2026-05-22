import { Href, router } from "expo-router";
import { Megaphone, RefreshCcw } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { SearchField } from "@/components/ui/search-field";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useAnnouncements } from "@/features/content/content-hooks";
import { Announcement } from "@/features/content/content-types";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function formatDate(date?: string | null) {
  if (!date) return "Not published";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AnnouncementRow({ item }: { item: Announcement }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/(student)/announcements/${item.slug}` as Href)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>
        {[item.category, formatDate(item.published_at)].filter(Boolean).join(" • ")}
      </Text>
      {item.excerpt ? (
        <Text style={styles.excerpt} numberOfLines={3}>
          {item.excerpt}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function AnnouncementsScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const announcementsQuery = useAnnouncements({ search, page, per_page: 10 });
  const result = announcementsQuery.data;
  const items = result?.items ?? [];
  const totalPages = result?.pagination.totalPages ?? 1;
  const refreshControl = usePullToRefresh(async () => {
    await announcementsQuery.refetch();
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
          subtitle="Latest published SRC announcements."
          title="Announcements"
        />
        <SearchField
          onChangeText={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search announcements"
          value={search}
        />

        {announcementsQuery.isLoading ? (
          <LoadingState message="Loading announcements..." />
        ) : announcementsQuery.isError ? (
          <EmptyState
            description="Announcements could not be loaded right now."
            icon={RefreshCcw}
            title="Unable to load"
          />
        ) : items.length === 0 ? (
          <EmptyState
            description="No published announcements match this search."
            icon={Megaphone}
            title="No announcements"
          />
        ) : (
          <>
            {items.map((item) => (
              <AnnouncementRow key={String(item.id)} item={item} />
            ))}
            {totalPages > page ? (
              <Button
                label="Load More"
                onPress={() => setPage((current) => current + 1)}
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
  title: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "900",
  },
  meta: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  excerpt: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
