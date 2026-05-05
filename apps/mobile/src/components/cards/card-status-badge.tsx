import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { CardStatus } from "@/features/cards/card-types";

type BadgeStatus = CardStatus | "none";

type CardStatusBadgeProps = {
  status: BadgeStatus;
};

const statusStyles: Record<
  BadgeStatus,
  { accent: string; background: string; label: string }
> = {
  active: {
    accent: colors.success,
    background: colors.successSoft,
    label: "Active",
  },
  revoked: {
    accent: colors.danger,
    background: colors.dangerSoft,
    label: "Revoked",
  },
  lost: {
    accent: colors.warning,
    background: colors.warningSoft,
    label: "Lost",
  },
  blocked: {
    accent: colors.warning,
    background: colors.warningSoft,
    label: "Blocked",
  },
  replaced: {
    accent: colors.textMuted,
    background: colors.surfaceMuted,
    label: "Replaced",
  },
  none: {
    accent: colors.textMuted,
    background: colors.surfaceMuted,
    label: "None",
  },
};

export function CardStatusBadge({ status }: CardStatusBadgeProps) {
  const palette = statusStyles[status];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <Text style={[styles.label, { color: palette.accent }]}>{palette.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
