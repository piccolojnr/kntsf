import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldAlert,
  UserRound,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import StudentPermitCard from "@/components/cards/student-permit-card";
import { AppRefreshControl } from "@/components/ui/app-refresh-control";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit, PermitStatus } from "@/features/permits/permit-types";
import { useStudentPermits } from "@/features/permits/use-student-permits";
import { useCurrentStudent } from "@/features/students/use-current-student";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

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

// ─── Status colours ───────────────────────────────────────────────────────────

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

// ─── SRC Permit Details Card ──────────────────────────────────────────────────

function SrcPermitDetailsCard({ permit }: { permit: Permit }) {
  return (
    <View style={detailStyles.card}>
      {/* Accent stripe */}

      <View style={detailStyles.inner}>
        {/* Header */}
        <View style={detailStyles.header}>
          <Text style={detailStyles.title}>SRC Permit Details</Text>
          <View
            style={[
              detailStyles.statusBadge,
              { backgroundColor: STATUS_SOFT[permit.status] },
            ]}
          >
            <View
              style={[
                detailStyles.statusDot,
                { backgroundColor: STATUS_COLOR[permit.status] },
              ]}
            />
            <Text
              style={[
                detailStyles.statusText,
                { color: STATUS_COLOR[permit.status] },
              ]}
            >
              {permit.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Permit code — large display */}
        <View style={detailStyles.codeBlock}>
          <Text style={detailStyles.codeLabel}>PERMIT CODE</Text>
          <Text style={detailStyles.codeValue}>{permit.permitCode}</Text>
        </View>

        {/* 2-column grid of fields */}
        <View style={detailStyles.grid}>
          <DetailCell label="Start Date" value={formatDate(permit.startDate)} />
          <DetailCell
            label="Expiry Date"
            value={formatDate(permit.expiryDate)}
            accent
          />
          <DetailCell
            label="Amount Paid"
            value={formatCurrency(permit.amountPaid)}
            primary
          />
          <DetailCell
            label="Days Remaining"
            value={daysRemaining(permit.expiryDate, permit.status)}
          />
        </View>
      </View>
    </View>
  );
}

function daysRemaining(expiryDate: string, status: PermitStatus): string {
  if (status !== "active") return "—";
  const diff = new Date(expiryDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Expired";
  return `${days} day${days !== 1 ? "s" : ""}`;
}

function DetailCell({
  label,
  value,
  accent,
  primary,
}: {
  label: string;
  value: string;
  accent?: boolean;
  primary?: boolean;
}) {
  return (
    <View style={detailStyles.cell}>
      <Text style={detailStyles.cellLabel}>{label}</Text>
      <Text
        style={[
          detailStyles.cellValue,
          accent && detailStyles.cellValueAccent,
          primary && detailStyles.cellValuePrimary,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    // shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentStripe: {
    backgroundColor: colors.primary,
    width: 4,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  inner: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  codeBlock: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  codeLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "600",
    letterSpacing: 1.4,
  },
  codeValue: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  cell: {
    gap: 4,
    width: "45%",
  },
  cellLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  cellValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  cellValueAccent: {
    color: colors.danger,
  },
  cellValuePrimary: {
    color: colors.primary,
  },
});

// ─── Permit History Table ─────────────────────────────────────────────────────

function PermitHistoryTable({ permits }: { permits: Permit[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(permits.length / PAGE_SIZE));
  const pagePermits = permits.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <View style={tableStyles.section}>
      {/* Section header */}
      <View style={tableStyles.sectionHeader}>
        <Text style={tableStyles.sectionTitle}>Permit History</Text>
        <Text style={tableStyles.sectionCount}>{permits.length} records</Text>
      </View>

      {permits.length === 0 ? (
        <EmptyState
          description="No permit records are linked to your account."
          icon={FileText}
          title="No permits found"
        />
      ) : (
        <View style={tableStyles.table}>
          {/* Column headers */}
          <View style={tableStyles.headerRow}>
            <Text style={[tableStyles.th, tableStyles.colIndex]}>#</Text>
            <Text style={[tableStyles.th, tableStyles.colCode]}>
              Permit Code
            </Text>
            <Text style={[tableStyles.th, tableStyles.colPeriod]}>Period</Text>
            <Text style={[tableStyles.th, tableStyles.colAmount]}>Amount</Text>
            <Text style={[tableStyles.th, tableStyles.colStatus]}>Status</Text>
          </View>

          {/* Rows */}
          {pagePermits.map((permit, i) => {
            const globalIndex = page * PAGE_SIZE + i + 1;
            const isEven = i % 2 === 1;
            return (
              <View
                key={permit.id}
                style={[
                  tableStyles.row,
                  isEven && tableStyles.rowAlt,
                  i === pagePermits.length - 1 && tableStyles.rowLast,
                ]}
              >
                <Text
                  style={[
                    tableStyles.td,
                    tableStyles.colIndex,
                    tableStyles.tdMuted,
                  ]}
                >
                  {globalIndex}
                </Text>
                <Text
                  style={[
                    tableStyles.td,
                    tableStyles.colCode,
                    tableStyles.tdBold,
                  ]}
                  numberOfLines={1}
                >
                  {permit.permitCode}
                </Text>
                <View style={[tableStyles.colPeriod, tableStyles.periodCol]}>
                  <Text style={tableStyles.tdDateFrom}>
                    {formatDate(permit.startDate)}
                  </Text>
                  <Text style={tableStyles.tdDateTo}>
                    → {formatDate(permit.expiryDate)}
                  </Text>
                </View>
                <Text
                  style={[
                    tableStyles.td,
                    tableStyles.colAmount,
                    tableStyles.tdAmount,
                  ]}
                >
                  {formatCurrency(permit.amountPaid)}
                </Text>
                <View style={tableStyles.colStatus}>
                  <View
                    style={[
                      tableStyles.statusBadge,
                      { backgroundColor: STATUS_SOFT[permit.status] },
                    ]}
                  >
                    <View
                      style={[
                        tableStyles.statusDot,
                        { backgroundColor: STATUS_COLOR[permit.status] },
                      ]}
                    />
                    <Text
                      style={[
                        tableStyles.statusText,
                        { color: STATUS_COLOR[permit.status] },
                      ]}
                    >
                      {permit.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Pagination */}
          <View style={tableStyles.pagination}>
            <TouchableOpacity
              style={[
                tableStyles.pageBtn,
                page === 0 && tableStyles.pageBtnDisabled,
              ]}
              onPress={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft
                size={14}
                color={page === 0 ? colors.border : colors.primary}
              />
              <Text
                style={[
                  tableStyles.pageBtnText,
                  page === 0 && tableStyles.pageBtnTextDisabled,
                ]}
              >
                Prev
              </Text>
            </TouchableOpacity>

            <Text style={tableStyles.pageCounter}>
              Page {page + 1} of {totalPages}
            </Text>

            <TouchableOpacity
              style={[
                tableStyles.pageBtn,
                page >= totalPages - 1 && tableStyles.pageBtnDisabled,
              ]}
              onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <Text
                style={[
                  tableStyles.pageBtnText,
                  page >= totalPages - 1 && tableStyles.pageBtnTextDisabled,
                ]}
              >
                Next
              </Text>
              <ChevronRight
                size={14}
                color={page >= totalPages - 1 ? colors.border : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const tableStyles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },

  // Table container
  table: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },

  // Header row
  headerRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  th: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Data rows
  row: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  rowAlt: {
    backgroundColor: "#f9fafb",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  td: {
    color: colors.text,
    fontSize: fontSizes.xs,
  },
  tdMuted: {
    color: colors.textMuted,
    fontWeight: "500",
  },
  tdBold: {
    fontWeight: "700",
    color: colors.primary,
  },
  tdAmount: {
    fontWeight: "700",
    color: colors.text,
  },
  periodCol: {
    gap: 2,
  },
  tdDateFrom: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "600",
  },
  tdDateTo: {
    color: colors.textMuted,
    fontSize: 10,
  },

  // Column widths
  colIndex: { width: 24 },
  colCode: { flex: 1.4 },
  colPeriod: { flex: 2 },
  colAmount: { flex: 1.4 },
  colStatus: { flex: 1.2, alignItems: "flex-end" },

  // Status badge
  statusBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statusDot: {
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  statusText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Pagination
  pagination: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  pageBtn: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  pageBtnDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  pageBtnText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  pageBtnTextDisabled: {
    color: colors.border,
  },
  pageCounter: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StudentPermitsScreen() {
  const studentQuery = useCurrentStudent();
  const student = studentQuery.student;
  const permitsQuery = useStudentPermits(student?.id);

  const isLoading = studentQuery.isLoading || permitsQuery.isLoading;
  const hasError = studentQuery.isError || permitsQuery.isError;

  const permits = sortPermits(permitsQuery.data ?? []);
  const activePermit = permits.find((p) => p.status === "active") ?? null;
  const refreshControl = usePullToRefresh(async () => {
    await Promise.all([studentQuery.refetch(), permitsQuery.refetch()]);
  });

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<AppRefreshControl {...refreshControl} />}
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
            {/* ── Permit Card hero ── */}
            {activePermit ? (
              <StudentPermitCard
                studentName={student.name}
                permit={activePermit}
              />
            ) : (
              <EmptyState
                description="No active permit is linked to your student record."
                icon={FileText}
                title="No active permit"
              />
            )}

            {/* ── SRC Permit Details ── */}
            {activePermit && <SrcPermitDetailsCard permit={activePermit} />}

            {/* ── Payment History Table ── */}
            <PermitHistoryTable permits={permits} />
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
});
