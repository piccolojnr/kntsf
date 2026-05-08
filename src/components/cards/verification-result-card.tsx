import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { VerificationResult } from "@/features/operations/verification-types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  UserRound,
  XCircle,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type VerificationResultCardProps = {
  result: VerificationResult;
  onViewPermit?: () => void;
  onViewStudent?: () => void;
};

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
    case "revoked_permit":
      return {
        accent: colors.warning,
        soft: colors.warningSoft,
        Icon: AlertTriangle,
        statusLabel:
          result.decision === "expired_permit"
            ? "EXPIRED"
            : result.decision === "revoked_permit"
              ? "REVOKED"
              : "NO PERMIT",
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
    case "revoked_permit":
      return "Permit Revoked";
    case "no_active_permit":
      return "Permit Missing";
    case "card_not_registered":
      return "Card Not Registered";
    case "card_inactive":
      return "Card Inactive";
    default:
      return result.method === "student_id"
        ? "Student Not Found"
        : "Verification Denied";
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
  onViewPermit,
  onViewStudent,
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
        {result.student ? (
          <View style={styles.studentMetaWrap}>
            <Text style={styles.bannerSubtitle}>
              {result.student.name} · {result.student.studentId}
            </Text>
            {onViewStudent ? (
              <Pressable onPress={onViewStudent} style={styles.studentAction}>
                <UserRound color={tone.accent} size={14} strokeWidth={2.2} />
                <Text style={[styles.studentActionLabel, { color: tone.accent }]}>
                  View Student
                </Text>
                <ChevronRight color={tone.accent} size={14} strokeWidth={2.4} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Message */}
      <View style={styles.section}>
        <Text style={styles.metaLabel}>MESSAGE</Text>
        <Text style={styles.message}>{result.message}</Text>
      </View>

      {/* Permit block */}
      {result.permit && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.metaLabel}>PERMIT</Text>
            {onViewPermit ? (
              <Pressable onPress={onViewPermit} style={styles.sectionAction}>
                <FileText color={tone.accent} size={14} strokeWidth={2.2} />
                <Text style={[styles.sectionActionLabel, { color: tone.accent }]}>
                  View Permit
                </Text>
                <ChevronRight color={tone.accent} size={14} strokeWidth={2.4} />
              </Pressable>
            ) : null}
          </View>
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
  bannerSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  studentMetaWrap: {
    gap: spacing.xs,
  },
  studentAction: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  studentActionLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
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
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  sectionAction: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  sectionActionLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  message: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: 2,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    maxWidth: "40%",
  },
  rowValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
    flexShrink: 1,
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
