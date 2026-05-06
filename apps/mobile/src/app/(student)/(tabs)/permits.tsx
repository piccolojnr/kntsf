import { FileText, ShieldAlert, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import StudentIDCard from "@/components/cards/student-id-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit, PermitStatus } from "@/features/permits/permit-types";
import { usePermits } from "@/features/permits/use-permits";
import { useCurrentStudent } from "@/features/students/use-current-student";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    currency: "GHS",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

function sortPermits(permits: Permit[]) {
  return [...permits].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
}

function PermitDetailRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && styles.detailValueAccent]}>
        {value}
      </Text>
    </View>
  );
}

const STATUS_COLOR: Record<PermitStatus, string> = {
  active: colors.success,
  expired: colors.warning,
  revoked: colors.danger,
};
const STATUS_SOFT: Record<PermitStatus, string> = {
  active: colors.successSoft,
  expired: colors.warningSoft,
  revoked: colors.dangerSoft,
};

function HistoryItem({ permit, isLast }: { permit: Permit; isLast?: boolean }) {
  return (
    <View style={[styles.historyItem, isLast && styles.historyItemLast]}>
      <View
        style={[
          styles.historyIcon,
          { backgroundColor: STATUS_SOFT[permit.status] },
        ]}
      >
        <FileText size={16} color={STATUS_COLOR[permit.status]} />
      </View>

      <View style={styles.historyBody}>
        <Text style={styles.historyCode}>{permit.permitCode}</Text>
        <Text style={styles.historyDates}>
          {formatDate(permit.startDate)} – {formatDate(permit.expiryDate)}
        </Text>
        <Text style={styles.historyAmount}>
          {formatCurrency(permit.amountPaid)}
        </Text>
      </View>

      <View
        style={[
          styles.historyBadge,
          { backgroundColor: STATUS_SOFT[permit.status] },
        ]}
      >
        <View
          style={[
            styles.historyDot,
            { backgroundColor: STATUS_COLOR[permit.status] },
          ]}
        />
        <Text
          style={[
            styles.historyBadgeText,
            { color: STATUS_COLOR[permit.status] },
          ]}
        >
          {permit.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

export default function StudentPermitsScreen() {
  const studentQuery = useCurrentStudent();
  const permitsQuery = usePermits();

  const isLoading = studentQuery.isLoading || permitsQuery.isLoading;
  const hasError = studentQuery.isError || permitsQuery.isError;
  const student = studentQuery.student;

  const permits = student
    ? sortPermits(
        (permitsQuery.data ?? []).filter((p) => p.studentId === student.id),
      )
    : [];
  const activePermit = permits.find((p) => p.status === "active") ?? null;

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Student"
          title="Permits"
          subtitle="Your active permit and payment history."
        />

        {isLoading ? (
          <LoadingState message="Loading your permits..." />
        ) : hasError ? (
          <EmptyState
            description="Your permit records could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load permits"
          />
        ) : !student ? (
          <EmptyState
            description="No linked student record was found for this account."
            icon={UserRound}
            title="Student record not found"
          />
        ) : (
          <>
            {/* ID Card hero — shows validity of active permit */}
            <StudentIDCard
              student={{
                name: student.name,
                studentId: student.studentId,
                programme: student.course,
                level: student.level,
                validUntil: activePermit
                  ? formatDate(activePermit.expiryDate)
                  : undefined,
                status: activePermit ? "active" : "revoked",
              }}
            />

            {/* Active permit details */}
            {activePermit ? (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>SRC Permit Details</Text>
                <View style={styles.detailsList}>
                  <PermitDetailRow
                    label="Permit Code"
                    value={activePermit.permitCode}
                  />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={styles.activeStatusBadge}>
                      <View style={styles.activeStatusDot} />
                      <Text style={styles.activeStatusText}>ACTIVE</Text>
                    </View>
                  </View>
                  <PermitDetailRow
                    label="Start Date"
                    value={formatDate(activePermit.startDate)}
                  />
                  <PermitDetailRow
                    label="Expiry Date"
                    value={formatDate(activePermit.expiryDate)}
                  />
                  <PermitDetailRow
                    label="Amount Paid"
                    value={formatCurrency(activePermit.amountPaid)}
                    accent
                  />
                </View>
              </View>
            ) : (
              <EmptyState
                description="No active permit is linked to your student record."
                icon={FileText}
                title="No active permit"
              />
            )}

            {/* Payment history */}
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Payment History</Text>
              {permits.length ? (
                <View style={styles.historyList}>
                  {permits.map((permit, index) => (
                    <HistoryItem
                      key={permit.id}
                      permit={permit}
                      isLast={index === permits.length - 1}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  description="No permit records are linked to your account."
                  icon={FileText}
                  title="No permits found"
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl + 72,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
  },

  // ── Permit details card ────────────────────────────────
  detailsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  detailsTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  detailsList: {
    gap: spacing.md,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  detailValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  detailValueAccent: {
    color: colors.primary,
  },

  // Active status badge (inline)
  activeStatusBadge: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeStatusDot: {
    backgroundColor: colors.success,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  activeStatusText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── History ────────────────────────────────────────────
  historySection: {
    gap: spacing.md,
  },
  historyTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  historyList: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  historyItem: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyIcon: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  historyBody: {
    flex: 1,
    gap: 2,
  },
  historyCode: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  historyDates: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  historyAmount: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  historyBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  historyDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  historyBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
