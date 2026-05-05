import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ShieldAlert,
  Wifi,
  XCircle,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Modal, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StudentInfoCard } from "@/components/cards/student-info-card";
import { Button } from "@/components/ui/button";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  registerCardForStudent,
  replaceCardForStudent,
  revokeCardForStudent,
} from "@/features/cards/card-api";
import { useCards } from "@/features/cards/use-cards";
import { Student } from "@/features/students/student-types";

type StudentDetailModalProps = {
  onClose: () => void;
  student: Student | null;
  visible: boolean;
};

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

export function StudentDetailModal({
  onClose,
  student,
  visible,
}: StudentDetailModalProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["85%", "95%"], []);
  
  const cardsQuery = useCards();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<
    "register" | "replace" | "revoke" | null
  >(null);

  const currentCard = useMemo(() => {
    if (!student) return null;
    const cards = (cardsQuery.data ?? [])
      .filter((card) => card.studentId === student.id)
      .sort(
        (left, right) =>
          new Date(right.registeredAt).getTime() -
          new Date(left.registeredAt).getTime()
      );
    return cards[0] ?? null;
  }, [cardsQuery.data, student]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  async function refreshCards() {
    await queryClient.invalidateQueries({ queryKey: ["cards"] });
  }

  function runAction(
    action: "register" | "replace" | "revoke",
    perform: () => Promise<unknown>,
    successMessage: string,
  ) {
    if (!student) return;

    Alert.alert(
      "Confirm Action",
      `${action[0].toUpperCase()}${action.slice(1)} card for ${student.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            try {
              setActionLoading(action);
              await perform();
              await refreshCards();
              Alert.alert("Action Complete", successMessage);
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
      ],
    );
  }

  const cardConfig = currentCard ? statusConfig[currentCard.status] : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => bottomSheetRef.current?.close()}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.handle}
          enablePanDownToClose={true}
        >
          <BottomSheetScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, spacing.xl) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {student ? (
              <>
                <StudentInfoCard student={student} />

                <View style={styles.cardSection}>
                  <Text style={styles.sectionEyebrow}>Assigned NFC Card</Text>

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

                  {/* ── Dynamic Actions ── */}
                  <View style={styles.actions}>
                    {!currentCard || currentCard.status !== "active" ? (
                      <Button
                        label="Register New Card"
                        loading={actionLoading === "register"}
                        onPress={() =>
                          runAction(
                            "register",
                            () => registerCardForStudent(student.id),
                            "A new card was successfully registered.",
                          )
                        }
                      />
                    ) : (
                      <>
                        <View style={styles.actionsRow}>
                          <View style={styles.actionGhost}>
                            <Button
                              fullWidth={false}
                              label="Replace Card"
                              loading={actionLoading === "replace"}
                              onPress={() =>
                                runAction(
                                  "replace",
                                  () => replaceCardForStudent(student.id),
                                  "The active card was replaced.",
                                )
                              }
                              size="compact"
                              variant="secondary"
                            />
                          </View>
                        </View>
                        <Button
                          label="Revoke Access"
                          loading={actionLoading === "revoke"}
                          onPress={() =>
                            runAction(
                              "revoke",
                              () => revokeCardForStudent(student.id),
                              "The active card was revoked.",
                            )
                          }
                          variant="danger"
                        />
                      </>
                    )}
                  </View>
                </View>
              </>
            ) : null}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  handle: {
    backgroundColor: colors.border,
    width: 48,
    height: 5,
    borderRadius: radius.pill,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },

  /* ── Virtual Card Section ── */
  cardSection: {
    gap: spacing.md,
  },
  sectionEyebrow: {
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
    fontSize: fontSizes.xxl,
    fontWeight: "800",
    letterSpacing: 2,
  },
  virtualCardDate: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },

  /* ── Actions ── */
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionGhost: {
    flex: 1,
  },
});
