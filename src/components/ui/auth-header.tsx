import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@/constants/theme";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  compact?: boolean;
};

export function AuthHeader({ title, subtitle, compact }: AuthHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  containerCompact: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    textAlign: "center",
  },
  titleCompact: {
    fontSize: fontSizes.xl,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    textAlign: "center",
  },
  subtitleCompact: {
    fontSize: fontSizes.sm,
  },
});
