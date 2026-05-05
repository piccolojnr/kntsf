import { Alert, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";

import { Button } from "../ui/button";

type PermitCardProps = {
  permit: Permit;
  student: Student | null;
};

const statusStyles = {
  active: {
    accent: colors.success,
    background: colors.successSoft,
  },
  expired: {
    accent: colors.warning,
    background: colors.warningSoft,
  },
  revoked: {
    accent: colors.danger,
    background: colors.dangerSoft,
  },
} as const;

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

function showPlaceholder(label: string) {
  Alert.alert("Action Unavailable", `${label} is not implemented yet.`);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function PermitCard({ permit, student }: PermitCardProps) {
  const statusPalette = statusStyles[permit.status];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.permitCode}>{permit.permitCode}</Text>
          <Text style={styles.studentName}>{student?.name ?? "Unknown Student"}</Text>
          <Text style={styles.studentId}>
            {student?.studentId ?? "No student ID"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusPalette.background },
          ]}
        >
          <Text style={[styles.statusLabel, { color: statusPalette.accent }]}>
            {permit.status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow label="Start Date" value={formatDate(permit.startDate)} />
        <DetailRow label="Expiry Date" value={formatDate(permit.expiryDate)} />
        <DetailRow
          label="Amount Paid"
          value={formatAmount(permit.amountPaid)}
        />
        <DetailRow label="Course" value={student?.course ?? "Unavailable"} />
      </View>

      <View style={styles.actions}>
        <Button
          fullWidth={false}
          label="View Details"
          onPress={() => showPlaceholder("View Details")}
          size="compact"
          variant="secondary"
        />
        <Button
          fullWidth={false}
          label="Verify"
          onPress={() => showPlaceholder("Verify")}
          size="compact"
          variant="secondary"
        />
        <Button
          fullWidth={false}
          label="Issue/Renew"
          onPress={() => showPlaceholder("Issue/Renew")}
          size="compact"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  permitCode: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  studentName: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
  },
  studentId: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  statusLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  detailValue: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
