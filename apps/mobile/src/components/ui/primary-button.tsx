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
  iconColor?: string;
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "danger";
};

export function PrimaryButton({
  iconColor,
  label,
  icon: Icon,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = "primary",
}: PrimaryButtonProps) {
  const isDanger = variant === "danger";
  const foregroundColor = isDanger ? colors.danger : "#ffffff";

  return (
    <Pressable
      style={[
        styles.button,
        isDanger && styles.buttonDanger,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={foregroundColor} />
      ) : (
        <View style={styles.content}>
          {Icon ? (
            <Icon
              color={iconColor ?? foregroundColor}
              size={18}
              strokeWidth={2.2}
            />
          ) : null}
          <Text style={[styles.label, isDanger && styles.labelDanger]}>{label}</Text>
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
  buttonDanger: {
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
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
  labelDanger: {
    color: colors.danger,
  },
});
