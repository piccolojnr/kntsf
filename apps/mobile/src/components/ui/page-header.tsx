import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  onBack?: () => void;
  style?: ViewStyle;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badgeText,
  onBack,
  style,
}: PageHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {onBack ? (
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <ChevronLeft color={colors.textMuted} size={18} strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      ) : null}
      <View style={styles.headerRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        {badgeText ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  backButtonPressed: {
    opacity: 0.65,
  },
  backButtonText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: 2,
  },
  dot: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
});
