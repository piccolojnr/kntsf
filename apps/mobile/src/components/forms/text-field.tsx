import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type TextFieldProps = TextInputProps & {
  label: string;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
};

export function TextField({
  label,
  style,
  rightActionLabel,
  onRightActionPress,
  ...props
}: TextFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />
        {rightActionLabel && onRightActionPress ? (
          <Pressable style={styles.action} onPress={onRightActionPress}>
            <Text style={styles.actionText}>{rightActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  inputShell: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSizes.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
});
