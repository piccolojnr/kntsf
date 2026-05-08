import { Href } from "expo-router";
import { PropsWithChildren, ReactElement } from "react";
import { RefreshControlProps, ScrollView, StyleSheet } from "react-native";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";

type AdminToolScreenProps = PropsWithChildren<{
  refreshControl?: ReactElement<RefreshControlProps>;
  subtitle: string;
  title: string;
}>;

export function AdminToolScreen({
  children,
  refreshControl,
  subtitle,
  title,
}: AdminToolScreenProps) {
  return (
    <RoleAccessGuard
      allowedRoles={["admin"]}
      getForbiddenHref={() => "/(operations)/(tabs)/scan" as Href}
    >
      <Screen scrolled>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <PageHeader eyebrow="Admin Tools" subtitle={subtitle} title={title} />
          {children}
        </ScrollView>
      </Screen>
    </RoleAccessGuard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl + 72,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
  },
});
