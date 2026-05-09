import { Href } from "expo-router";
import { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";

type AdminToolScreenProps = PropsWithChildren<{
  onRefresh: () => void;
  refreshing: boolean;
  subtitle: string;
  title: string;
}>;

export function AdminToolScreen({
  children,
  onRefresh,
  refreshing,
  subtitle,
  title,
}: AdminToolScreenProps) {
  return (
    <RoleAccessGuard
      allowedRoles={["admin"]}
      getForbiddenHref={() => "/(operations)/(tabs)/scan" as Href}
    >
      <Screen scrolled>
        <AppRefreshableScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        >
          <PageHeader eyebrow="Admin Tools" subtitle={subtitle} title={title} />
          {children}
        </AppRefreshableScrollView>
      </Screen>
    </RoleAccessGuard>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl + 72,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
  },
});
