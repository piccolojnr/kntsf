import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { VerificationResult } from "@/features/operations/scan-types";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

type VerificationResultCardProps = { result: VerificationResult };

type ResultTone = {
  accent: string;
  soft: string;
  Icon: typeof CheckCircle2;
  statusLabel: string;
};

function getResultTone(result: VerificationResult): ResultTone {
  switch (result.decision) {
    case "allowed":
      return {
        accent: colors.success,
        soft: colors.successSoft,
        Icon: CheckCircle2,
        statusLabel: "ALLOWED",
      };
    case "expired_permit":
    case "no_active_permit":
      return {
        accent: colors.warning,
        soft: colors.warningSoft,
        Icon: AlertTriangle,
        statusLabel:
          result.decision === "expired_permit" ? "EXPIRED" : "NO PERMIT",
      };
    default:
      return {
        accent: colors.danger,
        soft: colors.dangerSoft,
        Icon: XCircle,
        statusLabel: "DENIED",
      };
  }
}

function getVerdictLabel(result: VerificationResult) {
  switch (result.decision) {
    case "allowed":
      return "Permit Verified";
    case "expired_permit":
      return "Permit Expired";
    case "no_active_permit":
      return "Permit Missing";
    case "card_not_registered":
      return "Card Not Registered";
    case "card_inactive":
      return "Card Inactive";
    default:
      return "Verification Denied";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function VerificationResultCard({
  result,
}: VerificationResultCardProps) {
  const tone = getResultTone(result);
  const verdictLabel = getVerdictLabel(result);

  return (
    <View style={[styles.card, { borderColor: tone.accent }]}>
      {/* Header banner */}
      <View style={[styles.banner, { backgroundColor: tone.soft }]}>
        <View style={[styles.statusBadge, { backgroundColor: tone.accent }]}>
          <tone.Icon color="#fff" size={14} strokeWidth={2.8} />
          <Text style={styles.statusText}>{tone.statusLabel}</Text>
        </View>
        <Text style={[styles.verdict, { color: tone.accent }]}>
          {verdictLabel}
        </Text>
      </View>

      {/* Message */}
      <View style={styles.section}>
        <Text style={styles.metaLabel}>MESSAGE</Text>
        <Text style={styles.message}>{result.message}</Text>
      </View>

      {/* Student block */}
      {result.student && (
        <View style={styles.section}>
          <Text style={styles.metaLabel}>STUDENT</Text>
          <Row label="Name" value={result.student.name} />
          <View style={styles.divider} />
          <Row label="Student ID" value={result.student.studentId} />
          <View style={styles.divider} />
          <Row label="Course" value={result.student.course} />
          <View style={styles.divider} />
          <Row label="Level" value={result.student.level} />
        </View>
      )}

      {/* Permit block */}
      {result.permit && (
        <View style={styles.section}>
          <Text style={styles.metaLabel}>PERMIT</Text>
          <Row label="Code" value={result.permit.permitCode} />
          <View style={styles.divider} />
          <Row label="Status" value={result.permit.status} />
          <View style={styles.divider} />
          <Row label="Expires" value={formatDate(result.permit.expiryDate)} />
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerMeta}>
          {result.method === "student_id"
            ? "Looked up by student ID"
            : "Looked up by UID"}{" "}
          · {result.value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.md,
    overflow: "hidden",
  },
  banner: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  statusBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  verdict: {
    fontSize: fontSizes.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  section: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  message: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  rowValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
    paddingLeft: spacing.md,
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
  footer: {
    borderColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
    margin: spacing.lg,
    marginTop: 0,
    paddingTop: spacing.md,
  },
  footerMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "600",
  },
});
