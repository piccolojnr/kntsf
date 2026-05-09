import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  ScanLine,
  ShieldAlert,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardStatusBadge } from "@/components/cards/card-status-badge";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { RadarPulse } from "@/components/ui/radar-pulse";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  assignCardToStudent,
  CardAssignmentMode,
} from "@/features/cards/card-api";
import { useCards } from "@/features/cards/use-cards";
import { useStudentByStudentId } from "@/features/students/use-students";
import { useAuth } from "@/hooks/use-auth";
import { useNfcAvailability } from "@/hooks/use-nfc-availability";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useScreenDensity } from "@/hooks/use-screen-density";
import { readCardUid } from "@/lib/nfc/nfc-service";

type ScreenState = "idle" | "loading" | "result";
type AssignmentPhase =
  | "idle"
  | "reading_nfc"
  | "nfc_read_success"
  | "assigning"
  | "success"
  | "error";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OperationsCardAssignmentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { fixedScreen, height, isCompact, width } = useScreenDensity();
  const { isCheckingNfc, isNfcAvailable, refreshNfcAvailability } =
    useNfcAvailability();
  const queryClient = useQueryClient();
  const { mode, studentId } = useLocalSearchParams<{
    mode?: CardAssignmentMode;
    studentId?: string;
  }>();
  const requestedStudentId = studentId?.trim() ?? "";
  const studentQuery = useStudentByStudentId(requestedStudentId);
  const cardsQuery = useCards(
    requestedStudentId
      ? {
          search: requestedStudentId,
          page: 1,
          limit: 100,
        }
      : undefined,
  );

  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [assignmentPhase, setAssignmentPhase] =
    useState<AssignmentPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [assignedUid, setAssignedUid] = useState<string | null>(null);

  const assignmentMode: CardAssignmentMode =
    mode === "replace" ? "replace" : "register";
  const isNarrow = width < 380;
  const horizontalPadding = isNarrow ? spacing.md : spacing.lg;
  const assignmentHeroSize = Math.min(
    fixedScreen.heroSize,
    Math.max(176, width - horizontalPadding * 4),
    isCompact ? height * 0.32 : height * 0.36,
  );
  const assignmentBottomPadding =
    Math.max(insets.bottom, spacing.md) + spacing.xl;

  const student = useMemo(() => {
    return studentQuery.data?.studentId === requestedStudentId
      ? studentQuery.data
      : null;
  }, [requestedStudentId, studentQuery.data]);

  const currentCard = useMemo(() => {
    if (!student) return null;
    return (
      (cardsQuery.data ?? [])
        .filter(
          (card) =>
            card.studentId === student.id ||
            card.studentId === student.studentId ||
            card.student?.studentId === student.studentId,
        )
        .sort(
          (l, r) =>
            new Date(r.registeredAt).getTime() -
            new Date(l.registeredAt).getTime(),
        )[0] ?? null
    );
  }, [cardsQuery.data, student]);

  const isReadyForReplace =
    assignmentMode === "register" || currentCard?.status === "active";

  useFocusEffect(
    useCallback(() => {
      // Cleanup function runs when the screen loses focus (e.g. user goes back)
      return () => {
        setScreenState("idle");
        setAssignmentPhase("idle");
        setErrorMessage(null);
        setAssignedUid(null);
      };
    }, []),
  );

  const actionLabel =
    assignmentMode === "replace" ? "Replace Card" : "Register Card";

  const isResolvingStudent = Boolean(
    requestedStudentId &&
      !student &&
      (studentQuery.isLoading || studentQuery.isFetching),
  );
  const isLoading =
    !requestedStudentId ||
    isResolvingStudent ||
    studentQuery.isLoading ||
    cardsQuery.isLoading;
  const hasError = studentQuery.isError || cardsQuery.isError;
  const canManageCards = user?.role === "admin";
  const nfcUnavailable = !isCheckingNfc && !isNfcAvailable;
  const refreshControl = usePullToRefresh(async () => {
    await Promise.all([
      studentQuery.refetch(),
      cardsQuery.refetch(),
      refreshNfcAvailability(),
    ]);
  });

  const runAssignment = useCallback(
    async (nextUid: string) => {
      if (!student) {
        setErrorMessage("The selected student record could not be found.");
        return;
      }

      if (!nextUid.trim()) {
        setErrorMessage("No NFC card UID was found.");
        return;
      }

      setErrorMessage(null);
      setAssignmentPhase("assigning");
      setScreenState("loading");

      try {
        const nextCard = await assignCardToStudent({
          mode: assignmentMode,
          studentId: student.studentId,
          uid: nextUid.trim(),
        });

        await queryClient.invalidateQueries({ queryKey: ["cards"] });
        setAssignedUid(nextCard.uid);
        setAssignmentPhase("success");
        setScreenState("result");
      } catch (error) {
        setScreenState("idle");
        setAssignmentPhase("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The card could not be assigned.",
        );
      }
    },
    [assignmentMode, queryClient, student],
  );

  const handleAssignByNfc = useCallback(async () => {
    Keyboard.dismiss();
    setErrorMessage(null);

    if (!isNfcAvailable) {
      setErrorMessage("NFC scan is not supported on this device.");
      return;
    }

    setAssignmentPhase("reading_nfc");
    setScreenState("loading");

    try {
      const scannedUid = await readCardUid();

      if (!scannedUid) {
        setScreenState("idle");
        setAssignmentPhase("error");
        setErrorMessage("No NFC card was detected.");
        return;
      }

      setAssignmentPhase("nfc_read_success");
      await delay(450);
      await runAssignment(scannedUid);
    } catch (error) {
      setScreenState("idle");
      setAssignmentPhase("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "NFC card reading is not available right now.",
      );
    }
  }, [isNfcAvailable, runAssignment]);

  const loadingMessage =
    assignmentPhase === "reading_nfc"
      ? "Reading card..."
      : assignmentPhase === "nfc_read_success"
        ? "Card read successfully"
        : `${actionLabel} in progress...`;

  return (
    <View
      style={[
        styles.root,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {/* ── Drag handle ── */}
      <View style={styles.dragHandle} />

      {/* ── Sheet header ── */}
      <View style={styles.sheetHeader}>
        <View style={styles.headerDot} />
        <Text style={styles.eyebrow}>NFC CARD FLOW</Text>
      </View>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={[styles.title, isCompact && styles.titleCompact]}>
            {actionLabel}
          </Text>
          <Text style={styles.subtitle}>
            {student
              ? `${student.name} · ${student.studentId}`
              : "Loading student record…"}
          </Text>
        </View>
        <Button
          fullWidth={false}
          icon={ChevronLeft}
          label="Back"
          onPress={() => router.back()}
          size="compact"
          variant="secondary"
        />
      </View>

      {/* ── Body ── */}
      <Pressable style={styles.body} onPress={Keyboard.dismiss}>
        {isLoading ? (
          <LoadingState message="Loading student and card records..." />
        ) : !canManageCards ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Admin access required</Text>
            <View style={styles.restrictedRow}>
              <View style={styles.restrictedIconWrap}>
                <Lock color={colors.warning} size={18} strokeWidth={2.2} />
              </View>
              <Text style={styles.messageText}>
                Only admins can register or replace student cards. Return to the
                student record to continue reviewing details.
              </Text>
            </View>
          </View>
        ) : hasError ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Unable to load</Text>
            <Text style={styles.messageText}>
              Student or card records could not be loaded right now.
            </Text>
          </View>
        ) : !student ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Student not found</Text>
            <Text style={styles.messageText}>
              The selected student could not be resolved for this assignment.
            </Text>
          </View>
        ) : !isReadyForReplace ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>No active card to replace</Text>
            <Text style={styles.messageText}>
              Replacement requires an active card. Register a new card instead.
            </Text>
          </View>
        ) : screenState === "result" && assignedUid ? (
          /* ── Success state ── */
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            exiting={FadeOut.duration(200)}
            style={styles.resultStage}
          >
            <AppRefreshableScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.resultContent,
                {
                  gap: isCompact ? spacing.md : spacing.lg,
                  paddingBottom: assignmentBottomPadding,
                  paddingHorizontal: horizontalPadding,
                  paddingTop: isCompact ? spacing.md : spacing.xl,
                },
              ]}
              onRefresh={refreshControl.onRefresh}
              refreshing={refreshControl.refreshing}
              showsVerticalScrollIndicator={false}
            >
              {/* Success ring */}
              <View style={styles.successRing}>
                <CheckCircle2
                  color={colors.success}
                  size={48}
                  strokeWidth={1.5}
                />
              </View>

              <Text style={styles.successTitle}>
                {assignmentMode === "replace"
                  ? "Card Replaced"
                  : "Card Registered"}
              </Text>
              <Text style={styles.successSubtitle}>
                The student now has one active card ready for verification.
              </Text>

              {/* UID chip */}
              <View style={styles.uidChip}>
                <Text style={styles.uidChipLabel}>Card UID</Text>
                <Text style={styles.uidChipValue}>{assignedUid}</Text>
              </View>

              {/* Student summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryAvatar}>
                  <Text style={styles.summaryAvatarText}>
                    {student.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.summaryText}>
                  <Text style={styles.summaryName}>{student.name}</Text>
                  <Text style={styles.summaryMeta}>
                    {student.studentId} · {student.course}
                  </Text>
                </View>
                <CardStatusBadge status="active" />
              </View>

              <Button
                icon={CreditCard}
                label="Done"
                onPress={() => router.back()}
              />
            </AppRefreshableScrollView>
          </Animated.View>
        ) : (
          /* ── Idle / scanning state ── */
          <AppRefreshableScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.assignmentContent,
              {
                gap: isCompact ? spacing.sm : spacing.md,
                paddingBottom: assignmentBottomPadding,
                paddingHorizontal: horizontalPadding,
                paddingTop: isCompact ? spacing.sm : spacing.lg,
              },
            ]}
            onRefresh={refreshControl.onRefresh}
            refreshing={refreshControl.refreshing}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.radarCluster}>
              <RadarPulse
                active={
                  (screenState === "idle" ||
                    assignmentPhase === "reading_nfc") &&
                  isNfcAvailable
                }
                size={assignmentHeroSize}
                ringCount={3}
              >
                <ScanLine
                  color={isNfcAvailable ? "#ffffff" : colors.textMuted}
                  size={Math.min(
                    fixedScreen.heroIconSize,
                    assignmentHeroSize * 0.16,
                  )}
                  strokeWidth={2}
                />
              </RadarPulse>

              <View style={[styles.statusArea, { gap: fixedScreen.statusGap }]}>
                {screenState === "loading" ? (
                  <LoadingState
                    message={loadingMessage}
                    status={
                      assignmentPhase === "nfc_read_success"
                        ? "success"
                        : "loading"
                    }
                  />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.scanPrompt,
                        isCompact && styles.scanPromptCompact,
                      ]}
                    >
                      {assignmentMode === "replace"
                        ? "Place new card near reader"
                        : "Place card near reader"}
                    </Text>
                    <Text style={styles.scanHint}>
                      Scan the student card to continue
                    </Text>
                    <View style={styles.nfcAction}>
                      <Button
                        disabled={isCheckingNfc || nfcUnavailable}
                        label={isCheckingNfc ? "Checking NFC" : "Scan NFC Card"}
                        onPress={() => void handleAssignByNfc()}
                        variant="secondary"
                      />
                    </View>
                    {nfcUnavailable ? (
                      <View style={styles.nfcNotice}>
                        <ShieldAlert
                          color={colors.textMuted}
                          size={14}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.nfcNoticeText}>
                          NFC scan is not supported on this device. Card
                          assignment requires an Android development build with
                          NFC.
                        </Text>
                      </View>
                    ) : null}
                    {errorMessage ? (
                      <Animated.View
                        entering={FadeInDown.duration(200)}
                        exiting={FadeOut.duration(150)}
                        style={styles.inlineError}
                      >
                        <ShieldAlert
                          color={colors.danger}
                          size={14}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.inlineErrorText} numberOfLines={2}>
                          {errorMessage}
                        </Text>
                      </Animated.View>
                    ) : null}
                  </>
                )}
              </View>
            </View>

            {currentCard && assignmentMode === "replace" && (
              <View style={styles.currentCardPill}>
                <Text style={styles.currentCardLabel}>Current Card</Text>
                <Text style={styles.currentCardUid}>{currentCard.uid}</Text>
                <Text style={styles.currentCardMeta}>
                  Registered {formatDate(currentCard.registeredAt)}
                </Text>
              </View>
            )}
          </AppRefreshableScrollView>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  /* ── Sheet affordances ── */
  dragHandle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 4,
    marginTop: spacing.sm,
    width: 40,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerDot: {
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

  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  titleCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 30,
    flexShrink: 1,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 26,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "500",
    lineHeight: 20,
    flexShrink: 1,
  },

  /* ── Body ── */
  body: {
    flex: 1,
  },

  /* ── Radar / idle zone ── */
  assignmentContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
  },
  radarCluster: {
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
  },
  statusArea: {
    alignItems: "center",
    gap: spacing.xs,
    width: "100%",
  },
  scanPrompt: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  scanPromptCompact: {
    fontSize: fontSizes.md,
  },
  scanHint: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  nfcAction: {
    marginTop: spacing.sm,
    minWidth: 180,
    width: "100%",
    maxWidth: 260,
  },
  currentCardPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.md,
    maxWidth: 420,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: "100%",
  },
  currentCardLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  currentCardUid: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  currentCardMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    textAlign: "center",
  },

  inlineError: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    maxWidth: 320,
    paddingHorizontal: spacing.sm,
  },
  inlineErrorText: {
    color: colors.danger,
    flexShrink: 1,
    fontSize: fontSizes.xs,
    fontWeight: "700",
    textAlign: "center",
  },
  nfcNotice: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    maxWidth: 330,
    paddingHorizontal: spacing.sm,
  },
  nfcNoticeText: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: fontSizes.xs,
    fontWeight: "700",
    lineHeight: 17,
    textAlign: "center",
  },

  /* ── Success / result ── */
  resultStage: {
    flex: 1,
  },
  resultContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
  },
  successRing: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  successTitle: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  successSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 22,
    textAlign: "center",
  },
  uidChip: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    width: "100%",
  },
  uidChipLabel: {
    color: colors.primary,
    fontSize: fontSizes.xxs,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  uidChipValue: {
    color: colors.primary,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: fontSizes.lg,
    fontWeight: "800",
    letterSpacing: 2.5,
    textAlign: "center",
  },
  summaryCard: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    width: "100%",
  },
  summaryAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  summaryAvatarText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "800",
    letterSpacing: 1,
  },
  summaryText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  summaryName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  summaryMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "500",
    flexShrink: 1,
  },

  /* ── Message / error card ── */
  messageCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    margin: spacing.lg,
    padding: spacing.lg,
  },
  messageTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  messageText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  restrictedRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
  restrictedIconWrap: {
    alignItems: "center",
    backgroundColor: colors.warningSoft,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
});
