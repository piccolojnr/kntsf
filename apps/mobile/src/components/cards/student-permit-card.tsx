import {
  CalendarDays,
  CreditCard,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, radius, spacing } from "@/constants/theme";
import { Permit, PermitStatus } from "@/features/permits/permit-types";

export interface StudentPermitCardProps {
  studentName: string;
  permit: Permit;
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<
  PermitStatus,
  {
    label: string;
    color: string;
    backgroundColor: string;
    Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  }
> = {
  active: {
    label: "Active",
    color: colors.success,
    backgroundColor: colors.successSoft,
    Icon: ShieldCheck,
  },
  expired: {
    label: "Expired",
    color: colors.warning,
    backgroundColor: colors.warningSoft,
    Icon: ShieldAlert,
  },
  revoked: {
    label: "Revoked",
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    Icon: ShieldOff,
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    currency: currency || "GHS",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

function DateDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dateDetail}>
      <CalendarDays color={colors.textMuted} size={16} strokeWidth={1.8} />
      <View style={styles.dateText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text selectable style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function StudentPermitCard({
  studentName,
  permit,
  style,
}: StudentPermitCardProps) {
  const status = STATUS_CONFIG[permit.status] ?? STATUS_CONFIG.active;
  const { Icon: StatusIcon } = status;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <View style={styles.documentIcon}>
            <FileCheck2 color={colors.gold} size={23} strokeWidth={1.8} />
          </View>
          <View style={styles.identityText}>
            <Text style={styles.issuer}>KNUTSFORD SRC</Text>
            <Text style={styles.documentType}>Student permit</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.backgroundColor },
          ]}
        >
          <StatusIcon color={status.color} size={14} strokeWidth={2} />
          <Text style={[styles.statusLabel, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.codeBlock}>
        <Text style={styles.codeLabel}>PERMIT CODE</Text>
        <Text selectable style={styles.codeValue}>
          {permit.permitCode}
        </Text>
        <Text numberOfLines={1} style={styles.studentName}>
          Issued to {studentName}
        </Text>
      </View>

      <View style={styles.validityRow}>
        <DateDetail label="Valid from" value={formatDate(permit.startDate)} />
        <DateDetail label="Valid until" value={formatDate(permit.expiryDate)} />
      </View>

      <View style={styles.paymentBlock}>
        <View style={styles.paymentIdentity}>
          <View style={styles.paymentIcon}>
            <CreditCard color={colors.gold} size={20} strokeWidth={1.8} />
          </View>
          <View style={styles.paymentText}>
            <Text style={styles.paymentLabel}>PAYMENT CONFIRMED</Text>
            <Text style={styles.paymentNote}>SRC permit fee</Text>
          </View>
        </View>
        <Text selectable style={styles.paymentAmount}>
          {formatCurrency(permit.amountPaid, permit.currency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderCurve: "continuous",
    borderRadius: radius.xl,
    borderWidth: 1,
    boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
    gap: spacing.md,
    maxWidth: 440,
    padding: spacing.lg,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  identity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  documentIcon: {
    alignItems: "center",
    backgroundColor: colors.goldSoft,
    borderCurve: "continuous",
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  issuer: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  documentType: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 7,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  codeBlock: {
    backgroundColor: colors.navySoft,
    borderCurve: "continuous",
    borderRadius: radius.lg,
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  codeLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.6,
  },
  codeValue: {
    color: colors.navy,
    fontSize: 28,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  studentName: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  validityRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dateDetail: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderCurve: "continuous",
    borderRadius: radius.md,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0,
    padding: spacing.sm + 2,
  },
  dateText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "600",
  },
  detailValue: {
    color: colors.text,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  paymentBlock: {
    alignItems: "center",
    backgroundColor: colors.navy,
    borderCurve: "continuous",
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  paymentIdentity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  paymentIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderCurve: "continuous",
    borderRadius: radius.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  paymentText: {
    flex: 1,
    gap: 2,
  },
  paymentLabel: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  paymentNote: {
    color: "rgba(248,250,252,0.62)",
    fontSize: 11,
    fontWeight: "500",
  },
  paymentAmount: {
    color: colors.onNavy,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
});
