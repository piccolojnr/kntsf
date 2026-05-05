import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type SummaryTone = "success" | "warning" | "danger";

type StudentSummaryCardProps = {
  label: string;
  tone: SummaryTone;
  value: number;
};

const toneStyles: Record<
  SummaryTone,
  { accent: string; background: string; border: string }
> = {
  success: {
    accent: colors.success,
    background: colors.successSoft,
    border: colors.successSoft,
  },
  warning: {
    accent: colors.warning,
    background: colors.warningSoft,
    border: colors.warningSoft,
  },
  danger: {
    accent: colors.danger,
    background: colors.dangerSoft,
    border: colors.dangerSoft,
  },
};

export function StudentSummaryCard({
  label,
  tone,
  value,
}: StudentSummaryCardProps) {
  const palette = toneStyles[tone];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: palette.accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minHeight: 112,
    padding: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  value: {
    fontSize: fontSizes.xl,
    fontWeight: "800",
  },
});
