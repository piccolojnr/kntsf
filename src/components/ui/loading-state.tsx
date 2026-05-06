import { CheckCircle2 } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, fontSizes, spacing } from "@/constants/theme";

type LoadingStateProps = {
  message?: string;
  status?: "loading" | "success";
};

export function LoadingState({
  message = "Loading, please wait...",
  status = "loading",
}: LoadingStateProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (status === "success") {
      scale.value = withSequence(
        withTiming(1.2, { duration: 140, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }),
      );
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [scale, status]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.pill, status === "success" && styles.successPill]}>
        <Animated.View style={iconStyle}>
          {status === "success" ? (
            <CheckCircle2 color={colors.success} size={18} strokeWidth={2.6} />
          ) : (
            <ActivityIndicator color={colors.primary} size="small" />
          )}
        </Animated.View>
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
  successPill: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
