import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { PermitIssuanceConfig } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";
import { Button } from "../ui/button";

type PermitIssueConfirmationModalProps = {
  config: PermitIssuanceConfig | null | undefined;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: Student | null;
  visible: boolean;
};

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
      <Text style={styles.infoValue}>{value}</Text>
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
  if (!config || !student) {
    return null;
  }

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
          <Text style={styles.eyebrow}>Permit Issuance</Text>
          <Text style={styles.title}>Confirm Issue</Text>
          <Text style={styles.subtitle}>
            The permit details below come from the current backend configuration.
          </Text>

          <View style={styles.card}>
            <InfoRow label="Student" value={student.name} />
            <InfoRow label="Student ID" value={student.studentId} />
            <InfoRow label="Course" value={student.course} />
            <InfoRow label="Level" value={student.level} />
            <InfoRow label="Email" value={student.email} />
          </View>

          <View style={styles.card}>
            <InfoRow label="Amount" value={formatAmount(config.defaultAmount)} />
            <InfoRow
              label="Expiry Date"
              value={formatDate(config.expiryDate)}
            />
            <InfoRow label="Academic Year" value={config.academicYear} />
          </View>

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
                label="Confirm Issue"
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
    backgroundColor: "rgba(15, 23, 42, 0.36)",
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    gap: spacing.md,
    padding: spacing.lg,
    width: "100%",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 4,
    width: 40,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  infoRow: {
    gap: spacing.xs,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
});
