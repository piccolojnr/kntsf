import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { UserRole } from "@/features/auth/auth-types";

type RoleBadgeProps = {
  role: UserRole;
};

const roleStyles = {
  admin: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    label: "Admin",
  },
  staff: {
    backgroundColor: colors.warningSoft,
    color: colors.warning,
    label: "Staff",
  },
  student: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    label: "Student",
  },
} as const;

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleStyles[role];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
