import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ExternalLink, FileText } from "lucide-react-native";
import { Image, StyleSheet, Text } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useDocument } from "@/features/content/content-hooks";
import { DocumentFile } from "@/features/content/content-types";
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

function getFileUrl(file: DocumentFile) {
  return file.url ?? file.file_url ?? null;
}

export default function DocumentDetailScreen() {
  const slug = firstParam(useLocalSearchParams().slug);
  const documentQuery = useDocument(slug);
  const document = documentQuery.data;
  const refreshControl = usePullToRefresh(async () => {
    await documentQuery.refetch();
  });
  const files = [
    ...(document?.files ?? []),
    document?.file_url || document?.url
      ? [{ title: document.title, url: document.file_url ?? document.url }]
      : null,
  ].filter((file): file is DocumentFile => Boolean(file));

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        {documentQuery.isLoading ? (
          <LoadingState message="Loading document..." />
        ) : documentQuery.isError || !document ? (
          <EmptyState
            description="This document could not be loaded."
            icon={FileText}
            title="Document unavailable"
          />
        ) : (
          <>
            <PageHeader
              eyebrow={document.category ?? "Document"}
              onBack={() => router.back()}
              subtitle={formatDate(document.published_at)}
              title={document.title}
            />
            {document.image_url ? (
              <Image source={{ uri: document.image_url }} style={styles.image} />
            ) : null}
            <Text style={styles.body}>
              {cleanText(document.content ?? document.description ?? document.excerpt)}
            </Text>
            <SectionCard title="Files">
              {files.length === 0 ? (
                <Text style={styles.muted}>No public file links are available.</Text>
              ) : (
                files.map((file, index) => {
                  const url = getFileUrl(file);

                  return (
                    <Button
                      key={`${file.id ?? index}-${url ?? "file"}`}
                      disabled={!url}
                      icon={ExternalLink}
                      label={file.title ?? file.name ?? "Open Document"}
                      onPress={() => {
                        if (url) {
                          void WebBrowser.openBrowserAsync(url);
                        }
                      }}
                      variant="secondary"
                    />
                  );
                })
              )}
            </SectionCard>
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
  muted: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
