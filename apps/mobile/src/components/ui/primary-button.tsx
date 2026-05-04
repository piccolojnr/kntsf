import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  View,
} from "react-native";
import { LucideIcon } from "lucide-react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type PrimaryButtonProps = {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={[styles.button, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View style={styles.content}>
          {Icon ? (
            <Icon color="#ffffff" size={18} strokeWidth={2.2} />
          ) : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  label: {
    color: "#ffffff",
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
  },
});
