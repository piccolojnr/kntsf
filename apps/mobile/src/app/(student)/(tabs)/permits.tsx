import { FileText, ShieldAlert, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { DetailRow } from "@/components/ui/detail-row";
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
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

function formatStatus(status: PermitStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusPalette(status: PermitStatus) {
  switch (status) {
    case "active":
      return { background: colors.successSoft, foreground: colors.success };
    case "expired":
      return { background: colors.warningSoft, foreground: colors.warning };
    case "revoked":
      return { background: colors.dangerSoft, foreground: colors.danger };
  }
}

function sortPermits(permits: Permit[]) {
  return [...permits].sort(
    (left, right) =>
      new Date(right.startDate).getTime() - new Date(left.startDate).getTime(),
  );
}

function PermitHistoryItem({ permit }: { permit: Permit }) {
  const palette = getStatusPalette(permit.status);

  return (
    <View style={styles.permitRow}>
      <View style={styles.permitHeader}>
        <View style={styles.permitTitleGroup}>
          <Text style={styles.permitCode}>{permit.permitCode}</Text>
          <Text style={styles.permitDates}>
            {formatDate(permit.startDate)} - {formatDate(permit.expiryDate)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: palette.background }]}>
          <Text style={[styles.statusBadgeText, { color: palette.foreground }]}>
            {formatStatus(permit.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>{formatCurrency(permit.amountPaid)}</Text>
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
        (permitsQuery.data ?? []).filter((permit) => permit.studentId === student.id),
      )
    : [];
  const activePermit = permits.find((permit) => permit.status === "active") ?? null;

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Student"
          title="Permits"
          subtitle="View your active permit and permit history."
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
            <StatusCard
              title="Active Permit"
              value={activePermit ? "Available" : "Not Available"}
              description={
                activePermit
                  ? `${activePermit.permitCode} expires ${formatDate(activePermit.expiryDate)}.`
                  : "You do not currently have an active permit."
              }
              tone={activePermit ? "success" : "warning"}
            />

            {activePermit ? (
              <SectionCard title="Current Permit">
                <DetailRow label="Permit Code" value={activePermit.permitCode} />
                <DetailRow
                  label="Status"
                  value={formatStatus(activePermit.status)}
                  helper="This is the permit status operations staff will verify."
                />
                <DetailRow
                  label="Start Date"
                  value={formatDate(activePermit.startDate)}
                />
                <DetailRow
                  label="Expiry Date"
                  value={formatDate(activePermit.expiryDate)}
                />
                <DetailRow
                  label="Amount Paid"
                  value={formatCurrency(activePermit.amountPaid)}
                />
              </SectionCard>
            ) : null}

            <SectionCard title="Permit History">
              {permits.length ? (
                permits.map((permit) => (
                  <PermitHistoryItem key={permit.id} permit={permit} />
                ))
              ) : (
                <EmptyState
                  description="No permit records are currently linked to your student account."
                  icon={FileText}
                  title="No permits found"
                />
              )}
            </SectionCard>
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
  permitRow: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  permitHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  permitTitleGroup: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  permitCode: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  permitDates: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  amount: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
