import {
  CheckCircle2,
  FileText,
  Nfc,
  RotateCcw,
  ScanLine,
  ShieldAlert,
} from "lucide-react-native";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";

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
type ScanVisualState =
  | "idle"
  | "unavailable"
  | "reading"
  | "detected"
  | "verifying";

export default function OperationsScanScreen() {
  const router = useRouter();
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
      await issuePermit();
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
  const scanVisualState: ScanVisualState =
    !isNfcAvailable && !isCheckingNfc
      ? "unavailable"
      : phase === "reading_nfc"
        ? "reading"
        : phase === "nfc_read_success"
          ? "detected"
          : phase === "verifying_card_uid"
            ? "verifying"
            : "idle";
  const scanVisual = {
    idle: {
      color: colors.primary,
      duration: 2400,
      intensity: 1,
      title: "Ready to scan",
      hint: "Start the reader, then hold the card near this device",
      Icon: ScanLine,
      iconColor: "#ffffff",
    },
    unavailable: {
      color: colors.textMuted,
      duration: 2600,
      intensity: 0.65,
      title: "NFC unavailable",
      hint: "Use student ID verification instead",
      Icon: ScanLine,
      iconColor: "#ffffff",
    },
    reading: {
      color: "#0f766e",
      duration: 1300,
      intensity: 1.35,
      title: "Hold card near reader",
      hint: "Scanning NFC card",
      Icon: Nfc,
      iconColor: "#ffffff",
    },
    detected: {
      color: colors.success,
      duration: 900,
      intensity: 1.45,
      title: "Card detected",
      hint: "Preparing verification",
      Icon: CheckCircle2,
      iconColor: "#ffffff",
    },
    verifying: {
      color: "#1d4ed8",
      duration: 1500,
      intensity: 1.2,
      title: "Checking permit",
      hint: "Verifying card UID",
      Icon: ScanLine,
      iconColor: "#ffffff",
    },
  }[scanVisualState];

  return (
    <Screen>
      <View style={styles.flex}>
        <PageHeader
          badgeText={
            isCheckingNfc ? "CHECKING" : isNfcAvailable ? "READY" : "MANUAL"
          }
          eyebrow="NFC Operations"
          subtitle={
            isNfcAvailable
              ? "Tap a registered student card or enter a student ID."
              : "Enter a student ID to confirm permit access."
          }
          style={
            isCompact
              ? { ...styles.pageHeader, ...styles.pageHeaderCompact }
              : styles.pageHeader
          }
          title="Verify a permit"
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
              {result.reason === "student_not_found" &&
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
              styles.verificationContent,
              { paddingBottom: fixedScreen.tabBarClearance },
            ]}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
            showsVerticalScrollIndicator={false}
          >
            {isCheckingNfc || isNfcAvailable ? (
              <Animated.View
                entering={FadeInDown.duration(350)}
                style={styles.scanCard}
              >
                <View style={styles.scanCardHeader}>
                  <View style={styles.scanCardTitleWrap}>
                    <View style={styles.scanCardIcon}>
                      <Nfc color={colors.primary} size={18} strokeWidth={2.4} />
                    </View>
                    <View style={styles.scanCardTitleText}>
                      <Text style={styles.scanCardTitle}>Tap an NFC card</Text>
                      <Text style={styles.scanCardSubtitle}>
                        Hold the card near the back of this device
                      </Text>
                    </View>
                  </View>
                  <View style={styles.readerStatus}>
                    <View
                      style={[
                        styles.readerStatusDot,
                        {
                          backgroundColor: isCheckingNfc
                            ? colors.warning
                            : colors.success,
                        },
                      ]}
                    />
                    <Text style={styles.readerStatusText}>
                      {isCheckingNfc ? "Checking" : "Ready"}
                    </Text>
                  </View>
                </View>

                <RadarPulse
                  active={isNfcAvailable}
                  color={scanVisual.color}
                  duration={scanVisual.duration}
                  intensity={scanVisual.intensity}
                  size={isCompact ? 128 : 152}
                  ringCount={3}
                >
                  <scanVisual.Icon
                    color={scanVisual.iconColor}
                    size={isCompact ? 28 : 32}
                    strokeWidth={2}
                  />
                </RadarPulse>

                {screenState === "loading" ? (
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
                      {scanVisual.title}
                    </Text>
                    <Text style={styles.scanHint}>{scanVisual.hint}</Text>
                    <View style={styles.nfcAction}>
                      <Button
                        disabled={nfcUnavailable || isCheckingNfc}
                        icon={Nfc}
                        label={isCheckingNfc ? "Checking NFC" : "Scan NFC Card"}
                        onPress={() => void handleVerifyByNfc()}
                      />
                    </View>
                  </View>
                )}
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeIn.duration(250)}
                style={styles.manualModeNotice}
              >
                <View style={styles.manualModeIcon}>
                  <ShieldAlert
                    color={colors.textMuted}
                    size={20}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.manualModeCopy}>
                  <Text style={styles.manualModeTitle}>NFC reader unavailable</Text>
                  <Text style={styles.manualModeText}>
                    Manual verification is ready on this device.
                  </Text>
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(80).duration(350)}>
              <FloatingScanInput
                errorMessage={validationError ?? error}
                helperText="Enter the eight-digit ID printed on the student card."
                isLoading={loading}
                onChangeStudentId={setStudentId}
                onSubmit={() => void handleVerify()}
                studentId={studentId}
              />
            </Animated.View>

            <View style={styles.securityNote}>
              <CheckCircle2 color={colors.success} size={16} strokeWidth={2.4} />
              <Text style={styles.securityNoteText}>
                Verification checks the current permit record in real time.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

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

  verificationContent: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  scanCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    maxWidth: 520,
    padding: spacing.md,
    width: "100%",
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.07)",
  },
  scanCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  scanCardTitleWrap: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  scanCardTitleText: {
    flex: 1,
  },
  scanCardIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  scanCardTitle: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  scanCardSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 1,
  },
  readerStatus: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  readerStatusDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  readerStatusText: {
    color: colors.success,
    fontSize: fontSizes.xs,
    fontWeight: "800",
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
    marginTop: spacing.xs,
    minWidth: 240,
  },
  manualModeNotice: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  manualModeIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  manualModeCopy: {
    flex: 1,
    gap: 2,
  },
  manualModeTitle: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  manualModeText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    lineHeight: 17,
  },
  securityNote: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  securityNoteText: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: fontSizes.xs,
    lineHeight: 17,
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
