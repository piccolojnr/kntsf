import { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "default" | "compact";

type ButtonProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  label: string;
  loading?: boolean;
  onPress: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantStyles: Record<
  ButtonVariant,
  {
    backgroundColor: string;
    borderColor: string;
    foregroundColor: string;
  }
> = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    foregroundColor: "#ffffff",
  },
  secondary: {
    backgroundColor: colors.transparent,
    borderColor: colors.border,
    foregroundColor: colors.textMuted,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    foregroundColor: colors.danger,
  },
};

export function Button({
  disabled = false,
  fullWidth = true,
  icon: Icon,
  label,
  loading = false,
  onPress,
  size = "default",
  variant = "primary",
}: ButtonProps) {
  const palette = variantStyles[variant];
  const isCompact = size === "compact";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        !fullWidth && styles.inlineButton,
        isCompact && styles.compactButton,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: pressed ? 0.75 : disabled || loading ? 0.45 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.foregroundColor} size="small" />
      ) : (
        <View style={styles.content}>
          {Icon && (
            <Icon color={palette.foregroundColor} size={16} strokeWidth={2.5} />
          )}
          <Text
            style={[
              styles.label,
              isCompact && styles.labelCompact,
              { color: palette.foregroundColor },
            ]}
          >
            {label.toUpperCase()}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.pill, // fully pill-shaped
    borderWidth: 1.5,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  inlineButton: {
    alignSelf: "flex-start",
  },
  compactButton: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  labelCompact: {
    fontSize: fontSizes.xs,
    letterSpacing: 1.2,
  },
});
