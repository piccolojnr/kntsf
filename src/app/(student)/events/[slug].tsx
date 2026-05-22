import { router, useLocalSearchParams } from "expo-router";
import { CalendarClock } from "lucide-react-native";
import { Image, StyleSheet, Text } from "react-native";

import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useEvent } from "@/features/content/content-hooks";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date?: string | null) {
  if (!date) return "Date not set";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function cleanText(value?: string | null) {
  return (value ?? "").replace(/<[^>]*>/g, "").trim();
}

export default function EventDetailScreen() {
  const slug = firstParam(useLocalSearchParams().slug);
  const eventQuery = useEvent(slug);
  const event = eventQuery.data;
  const refreshControl = usePullToRefresh(async () => {
    await eventQuery.refetch();
  });

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        {eventQuery.isLoading ? (
          <LoadingState message="Loading event..." />
        ) : eventQuery.isError || !event ? (
          <EmptyState
            description="This event could not be loaded."
            icon={CalendarClock}
            title="Event unavailable"
          />
        ) : (
          <>
            <PageHeader
              eyebrow={event.category ?? "Event"}
              onBack={() => router.back()}
              subtitle={[formatDate(event.starts_at), event.location]
                .filter(Boolean)
                .join(" • ")}
              title={event.title}
            />
            {event.image_url ? (
              <Image source={{ uri: event.image_url }} style={styles.image} />
            ) : null}
            <Text style={styles.body}>
              {cleanText(event.content ?? event.description ?? event.excerpt)}
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
