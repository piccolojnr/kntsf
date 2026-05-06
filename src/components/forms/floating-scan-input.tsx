import { ArrowRight, ShieldAlert } from "lucide-react-native";
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        <View style={styles.inputArea}>
          <Text style={styles.prefix}>ID</Text>
          <View style={styles.inputStack}>
            {shouldShowGhost ? (
              <Text style={styles.ghostText} numberOfLines={1}>
                26102859
              </Text>
            ) : null}
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
              value={studentId}
            />
          </View>
        </View>

        <Pressable
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
    gap: spacing.sm,
    alignItems: "stretch",
  },
  helperText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    textAlign: "center",
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
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    height: 56,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
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
    justifyContent: "center",
  },
  prefix: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  ghostText: {
    color: colors.textMuted,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: fontSizes.lg,
    fontWeight: "700",
    left: 0,
    letterSpacing: 3,
    opacity: 0.45,
    position: "absolute",
    right: 0,
  },
  input: {
    backgroundColor: colors.transparent,
    color: colors.text,
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: fontSizes.lg,
    fontWeight: "700",
    letterSpacing: 3,
    paddingVertical: 0,
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
