import { AlertTriangle, CalendarDays, CreditCard, UserRound } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { PermitIssuanceConfig } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";

type PermitIssueConfirmationModalProps = {
  config: PermitIssuanceConfig | null | undefined;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: Student | null;
  visible: boolean;
};

function display(value: string | null | undefined) {
  return value?.trim() ? value : "Unavailable";
}

function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "Backend default";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Backend default";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount?: number, currency = "GHS") {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Backend default";
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function ReasonText({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) {
    return (
      <Text style={styles.warningText}>
        The backend returned a blocking state for this student.
      </Text>
    );
  }

  return (
    <View style={styles.reasonList}>
      {reasons.map((reason) => (
        <Text key={reason} style={styles.warningText}>
          {reason.replace(/_/g, " ")}
        </Text>
      ))}
    </View>
  );
}

export function PermitIssueConfirmationModal({
  config,
  isSubmitting,
  onClose,
  onConfirm,
  student,
  visible,
}: PermitIssueConfirmationModalProps) {
  if (!student) {
    return null;
  }

  const blocking = config?.blocking;
  const blockingReasons = blocking?.reasons ?? [];
  const isBlocked = Boolean(
    config &&
      (!config.enabled ||
        blocking?.hasActivePermit ||
        blocking?.hasOpenPermitRequest ||
        blocking?.missingEmail ||
        blocking?.missingPhone ||
        blockingReasons.length > 0),
  );

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <CreditCard color={colors.primary} size={20} strokeWidth={2.4} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Permit Issuance</Text>
              <Text style={styles.title}>Confirm permit issue</Text>
              <Text style={styles.subtitle}>
                Review the student and backend defaults before submitting.
              </Text>
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <UserRound color={colors.primary} size={16} strokeWidth={2.3} />
              <Text style={styles.panelTitle}>Student</Text>
            </View>
            <Text style={styles.studentName}>{display(student.name)}</Text>
            <View style={styles.studentMetaRow}>
              <Text style={styles.studentMeta}>{display(student.studentId)}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.studentMeta}>{display(student.level)}</Text>
            </View>
            <SummaryRow label="Course" value={display(student.course)} />
            <SummaryRow label="Email" value={display(student.email)} />
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <CalendarDays color={colors.primary} size={16} strokeWidth={2.3} />
              <Text style={styles.panelTitle}>Permit Defaults</Text>
            </View>
            <SummaryRow
              label="Amount"
              value={formatAmount(config?.defaultAmount, config?.currency)}
            />
            <SummaryRow label="Start" value={formatDate(config?.startDate)} />
            <SummaryRow label="Expires" value={formatDate(config?.expiryDate)} />
            <SummaryRow
              label="Period"
              value={
                [config?.academicYear, config?.semester]
                  .filter(Boolean)
                  .join(" • ") || "Backend default"
              }
            />
            {config?.validityDays ? (
              <SummaryRow label="Validity" value={`${config.validityDays} days`} />
            ) : null}
          </View>

          {isBlocked ? (
            <View style={styles.warningCard}>
              <AlertTriangle color={colors.warning} size={18} strokeWidth={2.4} />
              <View style={styles.warningCopy}>
                <Text style={styles.warningTitle}>Cannot issue yet</Text>
                <ReasonText reasons={blockingReasons} />
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <View style={styles.actionFlex}>
              <Button
                label="Cancel"
                onPress={onClose}
                size="compact"
                variant="secondary"
              />
            </View>
            <View style={styles.actionFlex}>
              <Button
                disabled={isBlocked}
                label="Confirm"
                loading={isSubmitting}
                onPress={onConfirm}
                size="compact"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    width: "100%",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 4,
    width: 44,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  panelTitle: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  studentName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  studentMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  studentMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  dot: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  summaryRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  summaryValue: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    textAlign: "right",
  },
  warningCard: {
    alignItems: "flex-start",
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  warningCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  warningTitle: {
    color: colors.warning,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  warningText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    textTransform: "capitalize",
  },
  reasonList: {
    gap: 2,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
});
