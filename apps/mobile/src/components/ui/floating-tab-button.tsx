import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/constants/theme";

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={styles.pressable}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View
        style={[
          styles.content,
          isSelected && styles.contentSelected,
          isPrimary && styles.primaryContent,
          isSelected && isPrimary && styles.primaryContentSelected,
        ]}
      >
        <Icon
          color={
            isSelected
              ? "#ffffff"
              : isPrimary
                ? colors.primary
                : colors.textMuted
          }
          size={18}
          strokeWidth={isSelected ? 2.4 : 2.1}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            isSelected && styles.labelSelected,
            isPrimary && styles.primaryLabel,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
  },
  contentSelected: {
    backgroundColor: colors.primary,
  },
  primaryContent: {
    backgroundColor: colors.primarySoft,
  },
  primaryContentSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  labelSelected: {
    color: "#ffffff",
  },
  primaryLabel: {
    color: colors.primary,
  },
});
