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
import { ScrollView, StyleSheet, View } from "react-native";

import { ProfileHeaderCard } from "@/components/cards/profile-header-card";
import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { NavigationListItem } from "@/components/ui/navigation-list-item";
import { PageHeader } from "@/components/ui/page-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";
import { useCards } from "@/features/cards/use-cards";
import { usePermits } from "@/features/permits/use-permits";
import { useStudents } from "@/features/students/use-students";
import { useAuth } from "@/hooks/use-auth";

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
  const studentsQuery = useStudents();
  const cardsQuery = useCards();
  const permitsQuery = usePermits();

  const isLoading =
    studentsQuery.isLoading || cardsQuery.isLoading || permitsQuery.isLoading;
  const hasError =
    studentsQuery.isError || cardsQuery.isError || permitsQuery.isError;

  const studentCount = (studentsQuery.data ?? []).length;
  const activePermitCount = (permitsQuery.data ?? []).filter(
    (permit) => permit.status === "active",
  ).length;
  const activeCardCount = (cardsQuery.data ?? []).filter(
    (card) => card.status === "active",
  ).length;

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Operations"
          subtitle="Review your workspace identity, access level, and live record counts."
          title="Profile"
        />
        {isLoading ? (
          <LoadingState message="Loading workspace profile..." />
        ) : hasError ? (
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

            <View style={styles.statusGrid}>
              <StatusCard
                title="Students Indexed"
                value={String(studentCount)}
                description="Student records currently available in the operations workspace."
                tone="primary"
              />
              <StatusCard
                title="Active Permits"
                value={String(activePermitCount)}
                description="Permits that are currently valid for verification."
                tone="success"
              />
              <StatusCard
                title="Active Cards"
                value={String(activeCardCount)}
                description="Student cards currently usable for card-based verification."
                tone="warning"
              />
            </View>

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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
