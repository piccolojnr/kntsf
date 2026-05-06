import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type StatusCardTone = "primary" | "success" | "warning" | "danger";

type StatusCardProps = {
  description: string;
  tone?: StatusCardTone;
  title: string;
  value: string;
};

const toneStyles: Record<
  StatusCardTone,
  { backgroundColor: string; borderColor: string; valueColor: string }
> = {
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
    valueColor: colors.primary,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successSoft,
    valueColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningSoft,
    valueColor: colors.warning,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
    valueColor: colors.danger,
  },
};

export function StatusCard({
  description,
  title,
  tone = "primary",
  value,
}: StatusCardProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: toneStyle.backgroundColor,
          borderColor: toneStyle.borderColor,
        },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: toneStyle.valueColor }]}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  description: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
