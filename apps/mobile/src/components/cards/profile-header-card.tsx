import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { UserRole } from "@/features/auth/auth-types";
import { StyleSheet, Text, View } from "react-native";
import { RoleBadge } from "../ui/role-badge";

type ProfileHeaderCardProps = {
  email: string;
  name: string;
  role: UserRole;
  subtitle: string;
  workspaceLabel: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

export function ProfileHeaderCard({
  email,
  name,
  role,
  subtitle,
  workspaceLabel,
}: ProfileHeaderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{getInitials(name)}</Text>
        </View>

        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
          <View style={styles.badges}>
            <View style={styles.workspaceBadge}>
              <Text style={styles.workspaceText}>{workspaceLabel}</Text>
            </View>
            <RoleBadge role={role} />
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: colors.gold,
    fontSize: fontSizes.lg,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  identity: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.navy,
    fontSize: fontSizes.lg,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  email: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  workspaceBadge: {
    borderWidth: 0.5,
    borderColor: `${colors.gold}55`,
    borderRadius: radius.sm,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  workspaceText: {
    color: colors.warning,
    fontSize: fontSizes.xs,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  divider: {
    height: 0.5,
    backgroundColor: colors.border,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
