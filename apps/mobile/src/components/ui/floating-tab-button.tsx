import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type FloatingTabButtonProps = {
  icon: LucideIcon;
  isSelected: boolean;
  label: string;
  isPrimary?: boolean;
  onLongPress?: () => void;
  onPress: () => void;
};

export function FloatingTabButton({
  icon: Icon,
  isPrimary = false,
  isSelected,
  label,
  onLongPress,
  onPress,
}: FloatingTabButtonProps) {
  const iconColor = isSelected
    ? colors.primary
    : isPrimary
      ? colors.primary
      : colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      android_ripple={null}
      style={[styles.pressable, isSelected && styles.pressableSelected]}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <Icon
        color={iconColor}
        size={20}
        strokeWidth={isSelected ? 2.5 : 2}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          isSelected && styles.labelSelected,
          isPrimary && styles.labelPrimary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  pressableSelected: {
    backgroundColor: colors.navySoft,
  },
  label: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: fontSizes.xxs,
    fontWeight: "700",
    lineHeight: fontSizes.xxs * 1.5,
    textAlign: "center",
  },
  labelSelected: {
    color: colors.primary,
  },
  labelPrimary: {
    color: colors.primary,
  },
});
