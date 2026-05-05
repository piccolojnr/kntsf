import { Href } from "expo-router";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ProfileHeaderCard } from "@/components/cards/profile-header-card";
import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { DetailRow } from "@/components/ui/detail-row";
import { NavigationListItem } from "@/components/ui/navigation-list-item";
import { PageHeader } from "@/components/ui/page-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, spacing } from "@/constants/theme";
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

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Operations"
          subtitle="Review your shared workspace identity, access level, and admin tools."
          title="Profile"
        />

        <ProfileHeaderCard
          email={user?.email ?? "operations@example.com"}
          name={user?.name ?? "Operations User"}
          role={user?.role ?? "staff"}
          subtitle="This workspace is shared by staff and admins, with access expanding according to your role."
          workspaceLabel="Operations"
        />

        <View style={styles.statusGrid}>
          <StatusCard
            title="Workspace Access"
            value="Enabled"
            description="Scanning, permits, and student support tools are available from this area."
            tone="primary"
          />
          <StatusCard
            title="Privilege Level"
            value={user?.role === "admin" ? "Admin" : "Staff"}
            description={
              user?.role === "admin"
                ? "You can open advanced administrative tools from this profile."
                : "You have standard operations access across shared staff workflows."
            }
            tone={user?.role === "admin" ? "warning" : "success"}
          />
        </View>

        <SectionCard title="Operations Access">
          <DetailRow
            label="User Name"
            value={user?.name ?? "Unknown User"}
            helper="This identity is shared across the operations workspace and reflects your assigned role."
          />
          <DetailRow
            label="Email"
            value={user?.email ?? "No email"}
            helper="Use this email for operations sign-in and future service notifications."
          />
          <DetailRow
            label="Role"
            value={user?.role === "admin" ? "Administrator" : "Staff Member"}
            helper="Role-based controls decide whether admin-only tools are available from this screen."
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

        <SectionCard title="Quick Focus">
          <View style={styles.focusRow}>
            <View style={styles.focusIconWrap}>
              <ShieldCheck color={colors.primary} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.focusCopy}>
              <Text style={styles.focusTitle}>Operational Readiness</Text>
              <Text style={styles.focusDescription}>
                Your workspace is positioned for permit handling, student
                lookup, and scanning tasks.
              </Text>
            </View>
          </View>
          <View style={styles.focusRow}>
            <View style={styles.focusIconWrap}>
              <Users color={colors.primary} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.focusCopy}>
              <Text style={styles.focusTitle}>Shared Staff Surface</Text>
              <Text style={styles.focusDescription}>
                Staff and admin users follow the same main workflow, with admin
                tools separated to avoid tab clutter.
              </Text>
            </View>
          </View>
        </SectionCard>

        <PrimaryButton
          label="Logout"
          icon={LogOut}
          onPress={logout}
          variant="danger"
        />
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
  focusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  focusIconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },
  focusCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  focusTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  focusDescription: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
