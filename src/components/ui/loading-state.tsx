import { colors, fontSizes, spacing } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = "Loading, please wait...",
}: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  pill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
