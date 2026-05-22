import { router, useLocalSearchParams } from "expo-router";
import { Megaphone } from "lucide-react-native";
import { Image, StyleSheet, Text } from "react-native";

import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useAnnouncement } from "@/features/content/content-hooks";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date?: string | null) {
  if (!date) return "Not published";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function cleanText(value?: string | null) {
  return (value ?? "").replace(/<[^>]*>/g, "").trim();
}

export default function AnnouncementDetailScreen() {
  const slug = firstParam(useLocalSearchParams().slug);
  const announcementQuery = useAnnouncement(slug);
  const announcement = announcementQuery.data;
  const refreshControl = usePullToRefresh(async () => {
    await announcementQuery.refetch();
  });

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        {announcementQuery.isLoading ? (
          <LoadingState message="Loading announcement..." />
        ) : announcementQuery.isError || !announcement ? (
          <EmptyState
            description="This announcement could not be loaded."
            icon={Megaphone}
            title="Announcement unavailable"
          />
        ) : (
          <>
            <PageHeader
              eyebrow={announcement.category ?? "Announcement"}
              onBack={() => router.back()}
              subtitle={formatDate(announcement.published_at)}
              title={announcement.title}
            />
            {announcement.image_url ? (
              <Image source={{ uri: announcement.image_url }} style={styles.image} />
            ) : null}
            <Text style={styles.body}>
              {cleanText(announcement.content ?? announcement.description ?? announcement.excerpt)}
            </Text>
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
  image: {
    backgroundColor: colors.border,
    borderRadius: radius.lg,
    height: 190,
    width: "100%",
  },
  body: {
    color: colors.text,
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
});
