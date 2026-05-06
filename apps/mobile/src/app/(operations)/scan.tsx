import { FileText, RotateCcw, ScanLine } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
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

import { PermitDetailModal } from "@/components/cards/permit-detail-modal";
import { PermitIssueConfirmationModal } from "@/components/cards/permit-issue-confirmation-modal";
import { VerificationResultCard } from "@/components/cards/verification-result-card";
import { FloatingScanInput } from "@/components/forms/floating-scan-input";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { RadarPulse } from "@/components/ui/radar-pulse";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  issuePermitFromVerification,
  verifyPermitByStudentId,
} from "@/features/operations/scan-api";
import { VerificationResult } from "@/features/operations/scan-types";

type ScreenState = "idle" | "loading" | "result";

/** Tab bar height (76) + bottom margin (~16) + extra breathing room for result actions. */
const TAB_BAR_CLEARANCE = 128;
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

  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [showPermitDetails, setShowPermitDetails] = useState(false);
  const [showIssueConfirm, setShowIssueConfirm] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setSuccessMessage(null);
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
    setSuccessMessage(null);
    setShowIssueConfirm(false);
    setShowPermitDetails(false);
    setStudentId("");
    setScreenState("idle");
  }

  async function handleIssuePermit() {
    if (!result) return;

    setIsIssuing(true);

    try {
      const issued = await issuePermitFromVerification(result);
      setResult({
        ...result,
        decision: "allowed",
        message: "Permit issued successfully.",
        permit: issued.permit,
        canIssuePermit: false,
        issuanceConfig: issued.issuanceConfig,
      });
      setSuccessMessage("Permit issued successfully.");
      setShowIssueConfirm(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Permit issuance failed. Try again.",
      );
    } finally {
      setIsIssuing(false);
    }
  }

  const canViewPermit =
    !!result?.permit &&
    (result.decision === "allowed" ||
      result.decision === "expired_permit" ||
      result.decision === "revoked_permit");

  return (
    <Screen>
      <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
        <PageHeader
          eyebrow="Operations"
          subtitle="Verify a student's permit status from their student ID."
          style={styles.pageHeader}
          title="Verify"
        />

        {/* ─── Stage ─── */}
        {screenState === "result" && result ? (
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            exiting={FadeOut.duration(200)}
            style={styles.resultStage}
          >
            <ScrollView
              contentContainerStyle={styles.resultContent}
              showsVerticalScrollIndicator={false}
            >
              {successMessage ? (
                <View style={styles.successNotice}>
                  <Text style={styles.successNoticeTitle}>Success</Text>
                  <Text style={styles.successNoticeText}>{successMessage}</Text>
                </View>
              ) : null}
              <VerificationResultCard result={result} />
              {result.decision === "denied" &&
              result.method === "student_id" ? (
                <View style={styles.infoNotice}>
                  <FileText
                    color={colors.warning}
                    size={18}
                    strokeWidth={2.2}
                  />
                  <Text style={styles.infoNoticeText}>
                    Student records must be added in the dashboard system before
                    a permit can be verified or issued here.
                  </Text>
                </View>
              ) : null}
              {result.issuanceConfig && !result.issuanceConfig.enabled ? (
                <View style={styles.closedNotice}>
                  <Text style={styles.closedNoticeTitle}>Issuance Closed</Text>
                  <Text style={styles.closedNoticeText}>
                    Permit issuance is currently closed.
                  </Text>
                </View>
              ) : null}
              <View style={styles.actions}>
                {canViewPermit ? (
                  <View style={styles.actionFlex}>
                    <Button
                      label="View Permit"
                      onPress={() => setShowPermitDetails(true)}
                      variant="secondary"
                    />
                  </View>
                ) : null}
                {result.canIssuePermit ? (
                  <View style={styles.actionFlex}>
                    <Button
                      label="Issue Permit"
                      onPress={() => setShowIssueConfirm(true)}
                    />
                  </View>
                ) : null}
              </View>
              <Button
                icon={RotateCcw}
                label="Verify Another"
                onPress={handleVerifyAnother}
                variant="secondary"
              />
            </ScrollView>
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
                  <Text style={styles.scanPrompt}>Verify Student Permit</Text>
                  <Text style={styles.scanHint}>Enter student ID below</Text>
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
            helperText="Most student IDs start with 2610."
            isLoading={screenState === "loading"}
            onChangeStudentId={setStudentId}
            onSubmit={() => void handleVerify()}
            studentId={studentId}
          />
        </Animated.View>
      )}

      <PermitIssueConfirmationModal
        config={result?.issuanceConfig}
        isSubmitting={isIssuing}
        onClose={() => setShowIssueConfirm(false)}
        onConfirm={() => void handleIssuePermit()}
        student={result?.student ?? null}
        visible={showIssueConfirm}
      />

      <PermitDetailModal
        onClose={() => setShowPermitDetails(false)}
        permit={result?.permit ?? null}
        student={result?.student ?? null}
        visible={showPermitDetails}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.lg },
  pageHeader: {
    paddingTop: 0,
  },

  /* ── Radar zone ── */
  radarZone: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingBottom: 300,
    paddingTop: spacing.md,
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
  },
  resultContent: {
    flexGrow: 1,
    gap: spacing.sm,
    justifyContent: "center",
    paddingBottom: TAB_BAR_CLEARANCE + spacing.xl,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
  closedNotice: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  closedNoticeTitle: {
    color: colors.warning,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  closedNoticeText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  infoNotice: {
    alignItems: "flex-start",
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  infoNoticeText: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  successNotice: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  successNoticeTitle: {
    color: colors.success,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  successNoticeText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
