import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type RoleOptionCardProps = {
  title: string;
  description: string;
  onPress: () => void;
  compact?: boolean;
};

export function RoleOptionCard({
  title,
  description,
  onPress,
  compact,
}: RoleOptionCardProps) {
  return (
    <Pressable style={[styles.card, compact && styles.cardCompact]} onPress={onPress}>
      <View style={[styles.badge, compact && styles.badgeCompact]}>
        <Text style={styles.badgeText}>{title.slice(0, 1)}</Text>
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={[styles.description, compact && styles.descriptionCompact]}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 148,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
    justifyContent: "center",
  },
  cardCompact: {
    gap: spacing.xs,
    minHeight: 128,
    padding: spacing.md,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeCompact: {
    paddingHorizontal: spacing.xs + 2,
  },
  badgeText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: "700",
  },
  titleCompact: {
    fontSize: fontSizes.lg,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
  descriptionCompact: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
