import { Href } from "expo-router";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Settings,
  Shield,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ProfileHeaderCard } from "@/components/cards/profile-header-card";
import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { LoadingState } from "@/components/ui/loading-state";
import { NavigationListItem } from "@/components/ui/navigation-list-item";
import { PageHeader } from "@/components/ui/page-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";
import { isAdmin } from "@/features/auth/auth-permissions";
import { useOperationsSummary } from "@/features/operations/use-operations-summary";
import { useAuth } from "@/hooks/use-auth";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

const adminTools: {
  description: string;
  href: Href;
  icon: typeof LayoutDashboard;
  label: string;
}[] = [
  {
    description: "Review the wider operations and governance overview.",
    href: "/(operations)/admin-dashboard" as Href,
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    description: "Manage card issuing, activation, and replacement workflows.",
    href: "/(operations)/cards" as Href,
    icon: CreditCard,
    label: "Cards",
  },
  {
    description: "Configure administrative preferences and workspace settings.",
    href: "/(operations)/settings" as Href,
    icon: Settings,
    label: "Settings",
  },
  {
    description: "Inspect protected actions and accountability records.",
    href: "/(operations)/audit-logs" as Href,
    icon: Shield,
    label: "Audit Logs",
  },
  {
    description: "Open summary reports for permits, students, and scans.",
    href: "/(operations)/reports" as Href,
    icon: BarChart3,
    label: "Reports",
  },
];

export default function OperationsProfileScreen() {
  const { user, logout } = useAuth();
  const canViewSummary = isAdmin(user);
  const summaryQuery = useOperationsSummary({ enabled: canViewSummary });

  const refreshControl = usePullToRefresh(async () => {
    if (canViewSummary) {
      await summaryQuery.refetch();
    }
  });

  const summary = summaryQuery.data;

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Operations"
          subtitle="Review your workspace identity, access level, and live record counts."
          title="Profile"
          tone="brand"
        />
        {canViewSummary && summaryQuery.isLoading ? (
          <LoadingState message="Loading workspace profile..." />
        ) : canViewSummary && (summaryQuery.isError || !summary) ? (
          <EmptyState
            description="Workspace profile data could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load profile"
          />
        ) : (
          <>
            <ProfileHeaderCard
              email={user?.email ?? "No email"}
              name={user?.name ?? "Unknown User"}
              role={user?.role ?? "staff"}
              subtitle="This workspace is shared by staff and admins, with access expanding according to your role."
              workspaceLabel="Operations"
            />

            {summary ? (
              <View style={styles.statusGrid}>
                <StatusCard
                  title="Students Indexed"
                  value={String(summary.totalStudents)}
                  description="Student records currently available in the operations workspace."
                  tone="primary"
                />
                <StatusCard
                  title="Active Permits"
                  value={String(summary.activePermits)}
                  description="Permits that are currently valid for verification."
                  tone="success"
                />
                <StatusCard
                  title="Active Cards"
                  value={String(summary.activeNfcCards)}
                  description="Student cards currently usable for card-based verification."
                  tone="warning"
                />
              </View>
            ) : null}

            <SectionCard title="Operations Access">
              <DetailRow
                label="User Name"
                value={user?.name ?? "Unknown User"}
                helper="This identity is used for the shared operations workspace."
              />
              <DetailRow
                label="Email"
                value={user?.email ?? "No email"}
                helper="Use this email for operations sign-in."
              />
              <DetailRow
                label="Role"
                value={user?.role === "admin" ? "Administrator" : "Staff Member"}
                helper={
                  user?.role === "admin"
                    ? "You can manage cards and access admin tools."
                    : "You can verify permits and inspect records, but admin-only tools stay restricted."
                }
              />
            </SectionCard>

            {user?.role === "admin" ? (
              <SectionCard title="Admin Tools">
                {adminTools.map((tool) => (
                  <NavigationListItem
                    key={tool.label}
                    description={tool.description}
                    href={tool.href}
                    icon={tool.icon}
                    label={tool.label}
                  />
                ))}
              </SectionCard>
            ) : null}

            <PrimaryButton
              label="Logout"
              icon={LogOut}
              onPress={logout}
              variant="danger"
            />
          </>
        )}
      </AppRefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
    paddingBottom: spacing.xxl + 72,
  },
  statusGrid: {
    gap: spacing.md,
  },
});
