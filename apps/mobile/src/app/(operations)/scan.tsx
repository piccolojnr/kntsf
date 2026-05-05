import { RotateCcw, ScanLine } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VerificationResultCard } from "@/components/cards/verification-result-card";
import { FloatingScanInput } from "@/components/forms/floating-scan-input";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { RadarPulse } from "@/components/ui/radar-pulse";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, spacing } from "@/constants/theme";
import { verifyPermitByStudentId } from "@/features/operations/scan-api";
import { VerificationResult } from "@/features/operations/scan-types";

type ScreenState = "idle" | "loading" | "result";

/** Tab bar height (76) + bottom margin (~16) + gap (12). */
const TAB_BAR_CLEARANCE = 104;
const ANIM_CONFIG = { duration: 280, easing: Easing.bezier(0.4, 0, 0.2, 1) };

function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) =>
      setHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}

export default function OperationsScanScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;

  const [studentId, setStudentId] = useState("2610");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>("idle");

  // Animate the pill's bottom offset
  const pillBottom = useSharedValue(
    Math.max(insets.bottom, spacing.sm) + TAB_BAR_CLEARANCE,
  );

  useEffect(() => {
    pillBottom.value = withTiming(
      keyboardOpen
        ? keyboardHeight + spacing.sm
        : Math.max(insets.bottom, spacing.sm) + TAB_BAR_CLEARANCE,
      ANIM_CONFIG,
    );
  }, [keyboardOpen, keyboardHeight, insets.bottom, pillBottom]);

  const pillAnimStyle = useAnimatedStyle(() => ({
    bottom: pillBottom.value,
  }));

  const handleVerify = useCallback(async () => {
    Keyboard.dismiss();
    const normalizedStudentId = studentId.replace(/[^\d]/g, "").trim();

    if (!normalizedStudentId) {
      setErrorMessage("Enter a student ID to verify.");
      setResult(null);
      return;
    }
    if (!/^\d+$/.test(normalizedStudentId)) {
      setErrorMessage("Digits only.");
      setResult(null);
      return;
    }
    if (normalizedStudentId.length !== 8) {
      setErrorMessage("Must be 8 digits, e.g. 26102859.");
      setResult(null);
      return;
    }

    setStudentId(normalizedStudentId);
    setErrorMessage(null);
    setScreenState("loading");

    try {
      const verificationResult =
        await verifyPermitByStudentId(normalizedStudentId);
      setResult(verificationResult);
      setScreenState("result");
    } catch (error) {
      setResult(null);
      setScreenState("idle");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Verification failed. Try again.",
      );
    }
  }, [studentId]);

  function handleVerifyAnother() {
    setResult(null);
    setErrorMessage(null);
    setStudentId("2610");
    setScreenState("idle");
  }

  return (
    <Screen style={styles.screen}>
      <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.dot} />
            <Text style={styles.eyebrow}>EXAM PERMIT SYSTEM</Text>
          </View>
          <Text style={styles.title}>Verify Permit</Text>
        </View>

        {/* ─── Stage ─── */}
        {screenState === "result" && result ? (
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            exiting={FadeOut.duration(200)}
            style={styles.resultStage}
          >
            <VerificationResultCard result={result} />
            <Button
              icon={RotateCcw}
              label="Verify Another"
              onPress={handleVerifyAnother}
              variant="secondary"
            />
          </Animated.View>
        ) : (
          <View style={styles.radarZone}>
            <RadarPulse
              active={screenState === "idle" && !keyboardOpen}
              size={300}
              ringCount={3}
            >
              <ScanLine color="#ffffff" size={42} strokeWidth={2} />
            </RadarPulse>

            {!keyboardOpen &&
              (screenState === "loading" ? (
                <View style={styles.statusArea}>
                  <LoadingState message="Verifying permit..." />
                </View>
              ) : (
                <View style={styles.statusArea}>
                  <Text style={styles.scanPrompt}>Tap to Scan NFC Card</Text>
                  <Text style={styles.scanHint}>or enter ID below</Text>
                </View>
              ))}
          </View>
        )}
      </Pressable>

      {/* ─── Floating Input Pill (absolutely positioned) ─── */}
      {screenState !== "result" && (
        <Animated.View style={[styles.floatingPill, pillAnimStyle]}>
          <FloatingScanInput
            errorMessage={errorMessage}
            isLoading={screenState === "loading"}
            onChangeStudentId={setStudentId}
            onSubmit={() => void handleVerify()}
            studentId={studentId}
          />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  screen: {
    paddingBottom: 0,
  },

  /* ── Header ── */
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: 2,
  },
  dot: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
  },

  /* ── Radar zone ── */
  radarZone: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingBottom: 300,
  },
  statusArea: {
    alignItems: "center",
    gap: spacing.xs,
  },
  scanPrompt: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  scanHint: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },

  /* ── Floating pill (absolute) ── */
  floatingPill: {
    left: spacing.lg,
    position: "absolute",
    right: spacing.lg,
  },

  /* ── Result ── */
  resultStage: {
    flex: 1,
    gap: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
  },
});
