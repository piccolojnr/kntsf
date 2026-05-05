import { useQueryClient } from "@tanstack/react-query";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  ShieldOff,
  Wifi,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "@/components/ui/screen";

import { StudentInfoCard } from "@/components/cards/student-info-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { revokeCardForStudent } from "@/features/cards/card-api";
import { useCards } from "@/features/cards/use-cards";
import { useStudents } from "@/features/students/use-students";

const statusConfig = {
  active: {
    accent: colors.success,
    soft: colors.successSoft,
    label: "Active",
    Icon: CheckCircle2,
  },
  inactive: {
    accent: colors.warning,
    soft: colors.warningSoft,
    label: "Inactive",
    Icon: AlertTriangle,
  },
  lost: {
    accent: colors.danger,
    soft: colors.dangerSoft,
    label: "Lost",
    Icon: ShieldAlert,
  },
  blocked: {
    accent: colors.danger,
    soft: colors.dangerSoft,
    label: "Blocked",
    Icon: XCircle,
  },
  replaced: {
    accent: colors.warning,
    soft: colors.warningSoft,
    label: "Replaced",
    Icon: AlertTriangle,
  },
  revoked: {
    accent: colors.danger,
    soft: colors.dangerSoft,
    label: "Revoked",
    Icon: XCircle,
  },
} as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OperationsStudentDetailsScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId?: string }>();
  const studentsQuery = useStudents();
  const cardsQuery = useCards();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<"revoke" | null>(null);

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

  async function refreshCards() {
    await queryClient.invalidateQueries({ queryKey: ["cards"] });
  }

  function runRevoke() {
    if (!student) return;
    Alert.alert("Confirm Action", `Revoke card for ${student.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading("revoke");
            await revokeCardForStudent(student.id);
            await refreshCards();
            Alert.alert("Done", "The active card has been revoked.");
          } catch (error) {
            Alert.alert(
              "Action Failed",
              error instanceof Error
                ? error.message
                : "The card action could not be completed.",
            );
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  }

  function openAssignmentFlow(mode: "register" | "replace") {
    if (!student) return;
    router.push(
      `/(operations)/card-assignment?studentId=${student.studentId}&mode=${mode}` as Href,
    );
  }

  const cardConfig = currentCard ? statusConfig[currentCard.status] : undefined;
  const isLoading = studentsQuery.isLoading || cardsQuery.isLoading;
  const hasError = studentsQuery.isError || cardsQuery.isError;
  const hasActiveCard = currentCard?.status === "active";

  return (
    <Screen scrolled>
      {/* ── Drag handle (sheet affordance) ── */}
      <View style={styles.dragHandle} />

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sheet header ── */}
        <View style={styles.sheetHeader}>
          <Text style={styles.eyebrow}>STUDENT RECORD</Text>
          <Text style={styles.title}>Student Details</Text>
        </View>

        {isLoading ? (
          <LoadingState message="Loading student and card records..." />
        ) : hasError ? (
          <EmptyState
            description="Student card details could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load student details"
          />
        ) : !student ? (
          <EmptyState
            description="No student record matched the requested student ID."
            icon={XCircle}
            title="Student not found"
          />
        ) : (
          <>
            {/* ── Hero identity block ── */}
            <StudentInfoCard student={student} />

            {/* ── NFC Card section ── */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionLabel}>Assigned NFC Card</Text>

              {currentCard && cardConfig ? (
                <View
                  style={[
                    styles.virtualCard,
                    { backgroundColor: cardConfig.soft },
                  ]}
                >
                  <View style={styles.virtualCardTop}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: cardConfig.accent },
                      ]}
                    >
                      <cardConfig.Icon
                        color="#fff"
                        size={13}
                        strokeWidth={2.5}
                      />
                      <Text style={styles.statusBadgeLabel}>
                        {cardConfig.label}
                      </Text>
                    </View>
                    <Wifi color={cardConfig.accent} size={24} />
                  </View>
                  <View style={styles.virtualCardBottom}>
                    <Text
                      style={[
                        styles.virtualCardUid,
                        { color: cardConfig.accent },
                      ]}
                    >
                      {currentCard.uid}
                    </Text>
                    <Text style={styles.virtualCardDate}>
                      Registered: {formatDate(currentCard.registeredAt)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.virtualCard, styles.virtualCardEmpty]}>
                  <CreditCard
                    color={colors.textMuted}
                    size={32}
                    strokeWidth={1.5}
                  />
                  <Text style={styles.virtualCardEmptyText}>
                    No active card assigned
                  </Text>
                </View>
              )}
            </View>

            {/* ── Action Buttons ── */}
            <View style={styles.actionsContainer}>
              {!hasActiveCard ? (
                <Button
                  icon={CreditCard}
                  label="Register New Card"
                  onPress={() => openAssignmentFlow("register")}
                />
              ) : (
                <View style={styles.actionRow}>
                  <View style={styles.actionFlex}>
                    <Button
                      icon={RefreshCw}
                      label="Replace"
                      onPress={() => openAssignmentFlow("replace")}
                      size="compact"
                      variant="secondary"
                    />
                  </View>
                  <View style={styles.actionFlex}>
                    <Button
                      icon={ShieldOff}
                      label="Revoke"
                      loading={actionLoading === "revoke"}
                      onPress={runRevoke}
                      size="compact"
                      variant="danger"
                    />
                  </View>
                </View>
              )}
            </View>
            <View style={{ height: spacing.xxxxxl * 2 }} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({


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
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  /* ── Scroll ── */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
  },

  /* ── NFC card section ── */
  cardSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  virtualCard: {
    borderRadius: radius.xl,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  virtualCardEmpty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderWidth: 2,
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  virtualCardEmptyText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  virtualCardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  virtualCardBottom: {
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  virtualCardUid: {
    fontSize: fontSizes.xl,
    fontWeight: "800",
    letterSpacing: 2,
  },
  virtualCardDate: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },

  /* ── Actions ── */
  actionsContainer: {
    paddingTop: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
});
