import { FileText, RotateCcw, ScanLine, ShieldAlert } from "lucide-react-native";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
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
import { useVerifyPermit } from "@/features/operations/use-verify-permit";
import { useNfcAvailability } from "@/hooks/use-nfc-availability";
import { useScreenDensity } from "@/hooks/use-screen-density";

type ScreenState = "idle" | "loading" | "result";

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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;
  const { fixedScreen, isCompact } = useScreenDensity();
  const { isCheckingNfc, isNfcAvailable } = useNfcAvailability();
  const {
    error,
    issuePermit,
    loading,
    phase,
    reset,
    result,
    verifyByNfc,
    verifyByStudentId,
  } = useVerifyPermit();

  const [studentId, setStudentId] = useState("2610");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [showPermitDetails, setShowPermitDetails] = useState(false);
  const [showIssueConfirm, setShowIssueConfirm] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Animate the pill's bottom offset
  const pillBottom = useSharedValue(
    Math.max(insets.bottom, spacing.sm) + fixedScreen.pillClearance,
  );

  useEffect(() => {
    pillBottom.value = withTiming(
      keyboardOpen
        ? keyboardHeight + spacing.sm
        : Math.max(insets.bottom, spacing.sm) + fixedScreen.pillClearance,
      ANIM_CONFIG,
    );
  }, [
    fixedScreen.pillClearance,
    keyboardOpen,
    keyboardHeight,
    insets.bottom,
    pillBottom,
  ]);

  const pillAnimStyle = useAnimatedStyle(() => ({
    bottom: pillBottom.value,
  }));

  useEffect(() => {
    if (loading) {
      setScreenState("loading");
      return;
    }

    if (result) {
      setScreenState("result");
      return;
    }

    setScreenState("idle");
  }, [loading, result]);

  const handleVerify = useCallback(async () => {
    Keyboard.dismiss();
    const normalizedStudentId = studentId.replace(/[^\d]/g, "").trim();

    if (!normalizedStudentId) {
      setValidationError("Enter a student ID to verify.");
      return;
    }
    if (!/^\d+$/.test(normalizedStudentId)) {
      setValidationError("Digits only.");
      return;
    }
    if (normalizedStudentId.length !== 8) {
      setValidationError("Must be 8 digits, e.g. 26102859.");
      return;
    }

    setStudentId(normalizedStudentId);
    setValidationError(null);
    setSuccessMessage(null);

    try {
      await verifyByStudentId(normalizedStudentId);
    } catch {}
  }, [studentId, verifyByStudentId]);

  const handleVerifyByNfc = useCallback(async () => {
    Keyboard.dismiss();
    setValidationError(null);
    setSuccessMessage(null);

    try {
      await verifyByNfc();
    } catch {}
  }, [verifyByNfc]);

  function handleVerifyAnother() {
    reset();
    setValidationError(null);
    setSuccessMessage(null);
    setShowIssueConfirm(false);
    setShowPermitDetails(false);
    setStudentId("2610");
  }

  function handleViewStudent() {
    if (!result?.student?.studentId) {
      return;
    }

    router.push(
      `/(operations)/student-details?studentId=${result.student.studentId}` as Href,
    );
  }

  async function handleIssuePermit() {
    if (!result?.student) return;

    setIsIssuing(true);

    try {
      await issuePermit(result.student.studentId);
      setSuccessMessage("Permit issued successfully.");
      setShowIssueConfirm(false);
    } catch {
    } finally {
      setIsIssuing(false);
    }
  }

  const canViewPermit =
    !!result?.permit &&
    (result.decision === "allowed" ||
      result.decision === "expired_permit" ||
      result.decision === "revoked_permit");
  const canIssuePermit = !!result?.canIssuePermit;
  const canViewStudent = !!result?.student;
  const nfcUnavailable = !isCheckingNfc && !isNfcAvailable;
  const loadingMessage =
    phase === "reading_nfc"
      ? "Reading card..."
      : phase === "nfc_read_success"
        ? "Card read successfully"
        : phase === "verifying_card_uid"
          ? "Checking permit..."
          : "Verifying permit...";

  return (
    <Screen>
      <View style={styles.flex}>
        <PageHeader
          eyebrow="Operations"
          subtitle="Verify a student's permit status from their student ID."
          style={
            isCompact
              ? { ...styles.pageHeader, ...styles.pageHeaderCompact }
              : styles.pageHeader
          }
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
              style={styles.scrollView}
              contentContainerStyle={[
                styles.resultContent,
                {
                  gap: fixedScreen.resultGap,
                  paddingTop: fixedScreen.resultTopPadding,
                  paddingBottom:
                    fixedScreen.tabBarClearance + fixedScreen.bottomToastOffset,
                },
              ]}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {successMessage ? (
                <View style={styles.successNotice}>
                  <Text style={styles.successNoticeTitle}>Success</Text>
                  <Text style={styles.successNoticeText}>{successMessage}</Text>
                </View>
              ) : null}
              <VerificationResultCard
                onViewPermit={canViewPermit ? () => setShowPermitDetails(true) : undefined}
                onViewStudent={canViewStudent ? handleViewStudent : undefined}
                result={result}
              />
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
              {canIssuePermit ? (
                <View style={styles.actions}>
                  <Button
                    label="Issue Permit"
                    onPress={() => setShowIssueConfirm(true)}
                  />
                </View>
              ) : null}
              <Button
                icon={RotateCcw}
                label="Verify Another"
                onPress={handleVerifyAnother}
                variant="secondary"
              />
            </ScrollView>
          </Animated.View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.radarZone,
              { paddingBottom: fixedScreen.heroBottomReserve },
            ]}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
            showsVerticalScrollIndicator={false}
          >
            <RadarPulse
              active={
                ((screenState === "idle" && !keyboardOpen) ||
                  phase === "reading_nfc") &&
                isNfcAvailable
              }
              size={fixedScreen.heroSize}
              ringCount={3}
            >
              <ScanLine
                color={isNfcAvailable ? "#ffffff" : colors.textMuted}
                size={fixedScreen.heroIconSize}
                strokeWidth={2}
              />
            </RadarPulse>

            {!keyboardOpen &&
              (screenState === "loading" ? (
                <View style={styles.statusArea}>
                  <LoadingState
                    message={loadingMessage}
                    status={phase === "nfc_read_success" ? "success" : "loading"}
                  />
                </View>
              ) : (
                <View
                  style={[styles.statusArea, { gap: fixedScreen.statusGap }]}
                >
                  <Text
                    style={[
                      styles.scanPrompt,
                      isCompact && styles.scanPromptCompact,
                    ]}
                  >
                    Verify Student Permit
                  </Text>
                  <Text style={styles.scanHint}>Enter student ID below</Text>
                  <View style={styles.nfcAction}>
                    <Button
                      disabled={nfcUnavailable || isCheckingNfc}
                      label={isCheckingNfc ? "Checking NFC" : "Scan NFC Card"}
                      onPress={() => void handleVerifyByNfc()}
                      variant="secondary"
                    />
                  </View>
                  {nfcUnavailable ? (
                    <View style={styles.nfcNotice}>
                      <ShieldAlert
                        color={colors.textMuted}
                        size={15}
                        strokeWidth={2.4}
                      />
                      <Text style={styles.nfcNoticeText}>
                        NFC scan is not supported on this device. Use student ID
                        verification instead.
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
          </ScrollView>
        )}
      </View>

      {/* ─── Floating Input Pill (absolutely positioned) ─── */}
      {screenState !== "result" && (
        <Animated.View style={[styles.floatingPill, pillAnimStyle]}>
          <FloatingScanInput
            errorMessage={validationError ?? error}
            helperText="Most student IDs start with 2610."
            isLoading={loading}
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
  scrollView: {
    flex: 1,
  },
  pageHeader: {
    paddingTop: 0,
  },
  pageHeaderCompact: {
    marginBottom: -4,
  },

  /* ── Radar zone ── */
  radarZone: {
    alignItems: "center",
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
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
  scanPromptCompact: {
    fontSize: fontSizes.md,
  },
  scanHint: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  nfcAction: {
    marginTop: spacing.sm,
    minWidth: 180,
  },
  nfcNotice: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    maxWidth: 320,
    paddingHorizontal: spacing.md,
  },
  nfcNoticeText: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: fontSizes.xs,
    fontWeight: "700",
    lineHeight: 17,
    textAlign: "center",
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
  },
  actions: {
    gap: spacing.sm,
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
