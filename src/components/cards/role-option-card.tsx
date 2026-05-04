import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type RoleOptionCardProps = {
  title: string;
  description: string;
  onPress: () => void;
};

export function RoleOptionCard({
  title,
  description,
  onPress,
}: RoleOptionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{title.slice(0, 1)}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
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
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
  description: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
});
