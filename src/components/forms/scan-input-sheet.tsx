import { useEffect } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { CheckCheck, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react-native";

type ScanInputSheetProps = {
  studentId: string;
  onChangeStudentId: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
};

const COLLAPSED_HEIGHT = 56;
const EXPANDED_HEIGHT = 280;

export function ScanInputSheet({
  studentId,
  onChangeStudentId,
  onSubmit,
  isLoading,
  errorMessage,
  expanded,
  onToggleExpand,
}: ScanInputSheetProps) {
  const animation = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    animation.value = withTiming(expanded ? 1 : 0, {
      duration: 350,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  }, [expanded, animation]);

  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animation.value,
      [0, 1],
      [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
    );
    return { height };
  });

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(animation.value, [0.3, 1], [0, 1]),
  }));

  const ChevronIcon = expanded ? ChevronDown : ChevronUp;

  return (
    <Animated.View style={[styles.sheet, containerStyle]}>
      {/* Collapsed handle / toggle bar */}
      <Pressable style={styles.handle} onPress={onToggleExpand}>
        <View style={styles.handleLeft}>
          <View style={styles.handleDot} />
          <Text style={styles.handleLabel}>
            {expanded ? "Manual Entry" : "Enter student ID manually"}
          </Text>
        </View>
        <ChevronIcon color={colors.textMuted} size={18} strokeWidth={2.5} />
      </Pressable>

      {/* Expandable content */}
      <Animated.View style={[styles.body, contentOpacity]}>
        <View style={styles.inputRow}>
          <View style={styles.inputShell}>
            <TextInput
              autoCorrect={false}
              keyboardType="number-pad"
              maxLength={8}
              onChangeText={(v) =>
                onChangeStudentId(v.replace(/[^\d]/g, "").slice(0, 8))
              }
              onSubmitEditing={onSubmit}
              placeholder="26102859"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              style={styles.input}
              value={studentId}
            />
          </View>
        </View>

        <View style={styles.hintRow}>
          <Text style={styles.hintLabel}>STUDENT ID</Text>
          <Text style={styles.hintText}>8 digits · starts with 2610</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <ShieldAlert
              color={colors.danger}
              size={16}
              strokeWidth={2.5}
            />
            <Text style={styles.errorText} numberOfLines={2}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Button
          icon={CheckCheck}
          label="Verify Permit"
          loading={isLoading}
          onPress={onSubmit}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: "hidden",
    elevation: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  handle: {
    alignItems: "center",
    flexDirection: "row",
    height: COLLAPSED_HEIGHT,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  handleLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  handleDot: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  handleLabel: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  body: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inputShell: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
  },
  input: {
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    letterSpacing: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  hintRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  hintLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    lineHeight: 20,
  },
});
