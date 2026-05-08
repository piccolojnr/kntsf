import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react-native";
import { useCallback, useMemo, useRef } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";

type PermitDetailModalProps = {
  onClose: () => void;
  permit: Permit | null;
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
  expired: {
    accent: colors.warning,
    soft: colors.warningSoft,
    label: "Expired",
    Icon: AlertTriangle,
  },
  revoked: {
    accent: colors.danger,
    soft: colors.dangerSoft,
    label: "Revoked",
    Icon: XCircle,
  },
} as const;

function resolvePermitStatus(status?: string) {
  switch (status) {
    case "active":
    case "expired":
    case "revoked":
      return status;
    default:
      return "expired";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <View style={styles.infoCardDivider} />
      {children}
    </View>
  );
}

export function PermitDetailModal({
  onClose,
  permit,
  student,
  visible,
}: PermitDetailModalProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
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

  const currentStatus = resolvePermitStatus(permit?.status);
  const config = statusConfig[currentStatus];
  const { Icon } = config;

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
            {permit ? (
              <>
                {/* ── Status Banner ── */}
                <View style={[styles.banner, { backgroundColor: config.soft }]}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: config.accent },
                    ]}
                  >
                    <Icon color="#fff" size={13} strokeWidth={2.5} />
                    <Text style={styles.statusBadgeLabel}>{config.label}</Text>
                  </View>
                  <Text
                    style={[styles.bannerPermitCode, { color: config.accent }]}
                  >
                    {permit.permitCode}
                  </Text>
                  <Text style={styles.bannerSubtitle}>
                    {student?.name ?? "Unknown Student"}
                    {student?.studentId ? ` · ${student.studentId}` : ""}
                  </Text>
                </View>

                {/* ── Student Info ── */}
                <InfoCard title="Student">
                  <InfoRow label="Name" value={student?.name ?? "Unknown"} />
                  <InfoRow
                    label="Student ID"
                    value={student?.studentId ?? "Unavailable"}
                  />
                  <InfoRow
                    label="Course"
                    value={student?.course ?? "Unavailable"}
                  />
                  <InfoRow
                    label="Level"
                    value={student?.level ?? "Unavailable"}
                  />
                </InfoCard>

                {/* ── Permit Info ── */}
                <InfoCard title="Permit">
                  <InfoRow label="Permit Code" value={permit.permitCode} />
                  <InfoRow
                    label="Start Date"
                    value={formatDate(permit.startDate)}
                  />
                  <InfoRow
                    label="Expiry Date"
                    value={formatDate(permit.expiryDate)}
                  />
                  <InfoRow
                    label="Amount Paid"
                    value={formatAmount(permit.amountPaid)}
                  />
                </InfoCard>
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
    gap: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ── Banner ── */
  banner: {
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  statusBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 5,
    marginBottom: spacing.xs,
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
  bannerPermitCode: {
    fontSize: fontSizes.xl,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },

  /* ── Info cards ── */
  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoCardTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  infoCardDivider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -spacing.lg,
  },
  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    maxWidth: "40%",
  },
  infoValue: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
});
