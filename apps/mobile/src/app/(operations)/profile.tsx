import { Href } from "expo-router";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
} from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { NavigationListItem } from "@/components/ui/navigation-list-item";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

const adminTools: {
  href: Href;
  icon: typeof LayoutDashboard;
  label: string;
}[] = [
  {
    href: "/(operations)/admin-dashboard" as Href,
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/(operations)/cards" as Href,
    icon: CreditCard,
    label: "Cards",
  },
  {
    href: "/(operations)/settings" as Href,
    icon: Settings,
    label: "Settings",
  },
  {
    href: "/(operations)/audit-logs" as Href,
    icon: Shield,
    label: "Audit Logs",
  },
  {
    href: "/(operations)/reports" as Href,
    icon: BarChart3,
    label: "Reports",
  },
];

export default function OperationsProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Operations Profile</Text>
          <Text style={styles.subtitle}>
            Review your account details and access operational tools.
          </Text>
        </View>

        <SectionCard title="Account">
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{user?.name ?? "Unknown User"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user?.email ?? "No email"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>{user?.role ?? "Unknown"}</Text>
          </View>
        </SectionCard>

        {user?.role === "admin" ? (
          <SectionCard title="Admin Tools">
            {adminTools.map((tool) => (
              <NavigationListItem
                key={tool.label}
                href={tool.href}
                icon={tool.icon}
                label={tool.label}
              />
            ))}
          </SectionCard>
        ) : null}

        <PrimaryButton label="Logout" icon={LogOut} onPress={logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  detailRow: {
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  detailValue: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
});
