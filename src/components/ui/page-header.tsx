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
  tone?: "default" | "brand";
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badgeText,
  onBack,
  style,
  tone = "default",
}: PageHeaderProps) {
  const branded = tone === "brand";

  return (
    <View style={[styles.container, branded && styles.brandContainer, style]}>
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
          <ChevronLeft
            color={branded ? "#cbd5e1" : colors.textMuted}
            size={18}
            strokeWidth={2.5}
          />
          <Text
            style={[
              styles.backButtonText,
              branded && styles.brandBackButtonText,
            ]}
          >
            Back
          </Text>
        </Pressable>
      ) : null}
      <View style={styles.headerRow}>
        <View style={[styles.dot, branded && styles.brandDot]} />
        <Text style={[styles.eyebrow, branded && styles.brandEyebrow]}>
          {eyebrow}
        </Text>
        {badgeText ? (
          <View style={[styles.badge, branded && styles.brandBadge]}>
            <Text style={[styles.badgeText, branded && styles.brandBadgeText]}>
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.title, branded && styles.brandTitle]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, branded && styles.brandSubtitle]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  brandContainer: {
    backgroundColor: colors.navy,
    borderCurve: "continuous",
    borderRadius: radius.xl,
    padding: spacing.lg,
    boxShadow: "0 12px 28px rgba(16, 42, 76, 0.18)",
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
  brandBackButtonText: {
    color: "#cbd5e1",
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
  brandDot: {
    backgroundColor: colors.gold,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brandEyebrow: {
    color: "#efd494",
  },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  brandBadge: {
    backgroundColor: "rgba(200, 146, 47, 0.16)",
    borderColor: "rgba(239, 212, 148, 0.5)",
    borderWidth: 1,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  brandBadgeText: {
    color: "#f5dda5",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  brandTitle: {
    color: colors.onNavy,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  brandSubtitle: {
    color: "#cbd5e1",
  },
});
