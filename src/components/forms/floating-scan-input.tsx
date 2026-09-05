import { ArrowRight, Hash, ShieldAlert } from "lucide-react-native";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type FloatingScanInputProps = {
  studentId: string;
  onChangeStudentId: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  helperText?: string;
};

export function FloatingScanInput({
  studentId,
  onChangeStudentId,
  onSubmit,
  isLoading,
  errorMessage,
  helperText,
}: FloatingScanInputProps) {
  const shouldShowGhost = studentId.length < 8;
  const ghostRemainder = "26102859".slice(studentId.length);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Hash color={colors.primary} size={14} strokeWidth={2.6} />
        <Text style={styles.label}>Student ID</Text>
      </View>
      <View style={styles.pill}>
        <View style={styles.inputArea}>
          <Text style={styles.prefix}>ID</Text>
          <View style={styles.inputStack}>
            <Text style={styles.displayText} numberOfLines={1}>
              {studentId ? (
                <Text style={styles.valueText}>{studentId}</Text>
              ) : null}
              {shouldShowGhost ? (
                <Text style={styles.ghostText}>{ghostRemainder}</Text>
              ) : null}
            </Text>
            <TextInput
              autoCorrect={false}
              keyboardType="number-pad"
              maxLength={8}
              onChangeText={(v) =>
                onChangeStudentId(v.replace(/[^\d]/g, "").slice(0, 8))
              }
              onSubmitEditing={onSubmit}
              returnKeyType="done"
              style={styles.input}
              caretHidden={false}
              value={studentId}
            />
          </View>
        </View>

        <Pressable
          accessibilityLabel="Verify student ID"
          accessibilityRole="button"
          disabled={isLoading}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.goButton,
            pressed && styles.goButtonPressed,
            isLoading && styles.goButtonLoading,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <ArrowRight color="#ffffff" size={20} strokeWidth={2.5} />
          )}
        </Pressable>
      </View>

      {errorMessage ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.inlineMessage}
        >
          <ShieldAlert color={colors.danger} size={14} strokeWidth={2.5} />
          <Text style={styles.errorText} numberOfLines={2}>
            {errorMessage}
          </Text>
        </Animated.View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.07)",
    alignItems: "stretch",
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  helperText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    lineHeight: 17,
    paddingHorizontal: spacing.xs,
  },
  inlineMessage: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.xs,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "center",
  },

  /* ── Pill ── */
  pill: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    height: 56,
    paddingLeft: spacing.lg,
    paddingRight: 6,
  },

  /* ── Input ── */
  inputArea: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  inputStack: {
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  prefix: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  displayText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: fontSizes.lg,
    fontWeight: "700",
    includeFontPadding: false,
    letterSpacing: 3,
    lineHeight: 32,
    textAlignVertical: "center",
  },
  valueText: {
    color: colors.text,
  },
  ghostText: {
    color: colors.textMuted,
    opacity: 0.45,
  },
  input: {
    backgroundColor: colors.transparent,
    color: colors.transparent,
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: fontSizes.lg,
    fontWeight: "700",
    includeFontPadding: false,
    letterSpacing: 3,
    lineHeight: 32,
    margin: 0,
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...StyleSheet.absoluteFill,
    textAlignVertical: "center",
  },

  /* ── Go button ── */
  goButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  goButtonPressed: {
    opacity: 0.75,
  },
  goButtonLoading: {
    opacity: 0.6,
  },
});
