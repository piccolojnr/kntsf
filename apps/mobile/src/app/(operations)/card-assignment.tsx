import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ScanLine,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { CardStatusBadge } from "@/components/cards/card-status-badge";
import { FloatingCardInput } from "@/components/forms/floating-card-input";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { RadarPulse } from "@/components/ui/radar-pulse";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  assignCardToStudent,
  CardAssignmentMode,
} from "@/features/cards/card-api";
import { useCards } from "@/features/cards/use-cards";
import { useStudents } from "@/features/students/use-students";
import { useAuth } from "@/hooks/use-auth";

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
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { mode, studentId } = useLocalSearchParams<{
    mode?: CardAssignmentMode;
    studentId?: string;
  }>();
  const studentsQuery = useStudents();
  const cardsQuery = useCards();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;

  const [uid, setUid] = useState("");
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [assignedUid, setAssignedUid] = useState<string | null>(null);

  const assignmentMode: CardAssignmentMode =
    mode === "replace" ? "replace" : "register";

  const student = useMemo(() => {
    const students = studentsQuery.data ?? [];
    return students.find((item) => item.studentId === studentId) ?? null;
  }, [studentId, studentsQuery.data]);

  const currentCard = useMemo(() => {
    if (!student) return null;
    return (
      (cardsQuery.data ?? [])
        .filter((card) => card.studentId === student.id)
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
        setErrorMessage(null);
        setAssignedUid(null);
        setUid("");
      };
    }, [])
  );

  // Floating pill offset — moves above keyboard when open
  const pillOffset = useSharedValue(Math.max(insets.bottom, spacing.md));

  useEffect(() => {
    pillOffset.value = withTiming(
      keyboardOpen
        ? keyboardHeight + spacing.sm
        : Math.max(insets.bottom, spacing.md),
      ANIM_CONFIG,
    );
  }, [keyboardOpen, keyboardHeight, insets.bottom, pillOffset]);

  const pillAnimStyle = useAnimatedStyle(() => ({
    bottom: pillOffset.value,
  }));

  const actionLabel =
    assignmentMode === "replace" ? "Replace Card" : "Register Card";

  const isLoading = studentsQuery.isLoading || cardsQuery.isLoading;
  const hasError = studentsQuery.isError || cardsQuery.isError;
  const canManageCards = user?.role === "admin";

  const handleAssign = useCallback(async () => {
    Keyboard.dismiss();

    if (!student) {
      setErrorMessage("The selected student record could not be found.");
      return;
    }

    if (!uid.trim()) {
      setErrorMessage("Enter a mock card UID to continue.");
      return;
    }

    setErrorMessage(null);
    setScreenState("loading");

    try {
      const nextCard = await assignCardToStudent({
        mode: assignmentMode,
        studentId: student.id,
        uid,
      });

      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      setAssignedUid(nextCard.uid);
      setScreenState("result");
    } catch (error) {
      setScreenState("idle");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The card could not be assigned.",
      );
    }
  }, [assignmentMode, queryClient, student, uid]);

  return (
    <View style={styles.root}>
      {/* ── Drag handle ── */}
      <View style={styles.dragHandle} />

      {/* ── Sheet header ── */}
      <View style={styles.sheetHeader}>
        <View style={styles.headerDot} />
        <Text style={styles.eyebrow}>NFC CARD FLOW</Text>
      </View>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={styles.title}>{actionLabel}</Text>
          <Text style={styles.subtitle}>
            {student
              ? `${student.name} · ${student.studentId}`
              : "Loading student record…"}
          </Text>
        </View>
        <Button
          fullWidth={false}
          icon={X}
          label="Close"
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
            <ScrollView
              contentContainerStyle={styles.resultContent}
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
            </ScrollView>
          </Animated.View>
        ) : (
          /* ── Idle / scanning state ── */
          <View style={styles.radarZone}>
            <RadarPulse
              active={screenState === "idle" && !keyboardOpen}
              size={260}
              ringCount={3}
            >
              <ScanLine color="#ffffff" size={38} strokeWidth={2} />
            </RadarPulse>

            {!keyboardOpen && (
              <View style={styles.statusArea}>
                <Text style={styles.scanPrompt}>
                  {assignmentMode === "replace"
                    ? "Place new card near reader"
                    : "Place card near reader"}
                </Text>
                <Text style={styles.scanHint}>or enter mock UID below</Text>
              </View>
            )}

            {currentCard && assignmentMode === "replace" && (
              <View style={styles.currentCardPill}>
                <Text style={styles.currentCardLabel}>Current Card</Text>
                <Text style={styles.currentCardUid}>{currentCard.uid}</Text>
                <Text style={styles.currentCardMeta}>
                  Registered {formatDate(currentCard.registeredAt)}
                </Text>
              </View>
            )}

            {screenState === "loading" && (
              <View style={styles.loadingWrap}>
                <LoadingState message={`${actionLabel} in progress...`} />
              </View>
            )}
          </View>
        )}
      </Pressable>

      {/* ── Floating UID input pill ── */}
      {screenState !== "result" &&
        student &&
        !isLoading &&
        canManageCards &&
        !hasError &&
        isReadyForReplace && (
          <Animated.View style={[styles.floatingPill, pillAnimStyle]}>
            <FloatingCardInput
              errorMessage={errorMessage}
              isLoading={screenState === "loading"}
              onChangeUid={setUid}
              onSubmit={() => void handleAssign()}
              uid={uid}
            />
          </Animated.View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
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
    alignItems: "flex-start",
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
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "500",
    lineHeight: 20,
  },

  /* ── Body ── */
  body: {
    flex: 1,
  },

  /* ── Radar / idle zone ── */
  radarZone: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    // Reserve space for floating pill (~80px pill + safe bottom)
    paddingBottom: 120,
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
  currentCardPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  },
  currentCardMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },

  /* ── Floating pill ── */
  floatingPill: {
    left: spacing.lg,
    position: "absolute",
    right: spacing.lg,
  },

  /* ── Success / result ── */
  resultStage: {
    flex: 1,
  },
  resultContent: {
    alignItems: "center",
    gap: spacing.lg,
    paddingBottom: spacing.xxxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  },
  summaryCard: {
    alignItems: "center",
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
  },
  summaryName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  summaryMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "500",
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
  loadingWrap: {
    alignSelf: "stretch",
    marginTop: spacing.md,
  },
});
