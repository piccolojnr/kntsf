import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PermitDetailModal } from "@/components/cards/permit-detail-modal";
import { PermitLedgerRow } from "@/components/cards/permit-ledger-row";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { SearchField } from "@/components/ui/search-field";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit, PermitStatus } from "@/features/permits/permit-types";
import { usePermitsPage } from "@/features/permits/use-permits";
import { Student } from "@/features/students/student-types";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

type FilterTab = "all" | PermitStatus;

type PermitListItem = {
  permitCodeSearch: string;
  studentIdSearch: string;
  studentNameSearch: string;
  permit: Permit;
  student: Student | null;
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expired", label: "Expired" },
  { key: "revoked", label: "Revoked" },
];

const statConfig = {
  active: { label: "Active", accent: colors.success, soft: colors.successSoft },
  expired: {
    label: "Expired",
    accent: colors.warning,
    soft: colors.warningSoft,
  },
  revoked: { label: "Revoked", accent: colors.danger, soft: colors.dangerSoft },
} as const;

const PAGE_SIZE = 10;

export default function OperationsPermitsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  const permitsQuery = usePermitsPage({
    search: searchTerm,
    status: activeFilter,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const permitItems = useMemo<PermitListItem[]>(() => {
    const permits = permitsQuery.data?.items ?? [];

    return permits.map((permit) => {
      const student = permit.student ?? null;
      return {
        permit,
        student,
        permitCodeSearch: permit.permitCode.toLowerCase(),
        studentIdSearch: student?.studentId.toLowerCase() ?? "",
        studentNameSearch: student?.name.toLowerCase() ?? "",
      };
    });
  }, [permitsQuery.data?.items]);

  const summary = useMemo(
    () =>
      permitItems.reduce(
        (counts, item) => {
          counts[item.permit.status] += 1;
          return counts;
        },
        { active: 0, expired: 0, revoked: 0 },
      ),
    [permitItems],
  );

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return permitItems.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.permit.status === activeFilter;
      const matchesSearch =
        !q ||
        item.permitCodeSearch.includes(q) ||
        item.studentIdSearch.includes(q) ||
        item.studentNameSearch.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [permitItems, searchTerm, activeFilter]);

  const selectedPermitItem =
    selectedPermitId === null
      ? null
      : (filteredItems.find((i) => i.permit.id === selectedPermitId) ??
        permitItems.find((i) => i.permit.id === selectedPermitId) ??
        null);

  const isLoading = permitsQuery.isLoading;
  const hasError = permitsQuery.isError;
  const pagination = permitsQuery.data?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const refreshControl = usePullToRefresh(async () => {
    await permitsQuery.refetch();
  });

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Operations"
          subtitle="Search, review, and inspect permit records across the workspace."
          title="Permits"
        />

        {/* ── Stat Chips ── */}
        <View style={styles.statRow}>
          {(["active", "expired", "revoked"] as const).map((key) => {
            const cfg = statConfig[key];
            return (
              <Pressable
                key={key}
                onPress={() =>
                  setActiveFilter(activeFilter === key ? "all" : key)
                }
                style={[
                  styles.statChip,
                  { backgroundColor: cfg.soft },
                  activeFilter === key && {
                    borderColor: cfg.accent,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={[styles.statCount, { color: cfg.accent }]}>
                  {summary[key]}
                </Text>
                <Text style={[styles.statLabel, { color: cfg.accent }]}>
                  {cfg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Search Bar ── */}
        <SearchField
          onChangeText={setSearchTerm}
          placeholder="Search by name, ID or permit code…"
          value={searchTerm}
        />

        {/* ── Filter Tabs ── */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
              >
                <Text
                  style={[
                    styles.filterTabLabel,
                    isActive && styles.filterTabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── List ── */}
        {isLoading ? (
          <LoadingState message="Loading permit records..." />
        ) : hasError ? (
          <EmptyState
            description="Permit records could not be loaded right now."
            icon={FileText}
            title="Unable to load permits"
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            description="No permits matched your search or filter."
            icon={Search}
            title="No permits found"
          />
        ) : (
          <View style={styles.list}>
            {filteredItems.map((item) => (
              <PermitLedgerRow
                key={item.permit.id}
                onPress={() => setSelectedPermitId(item.permit.id)}
                permit={item.permit}
                student={item.student}
              />
            ))}
            <View style={styles.paginationRow}>
              <Pressable
                disabled={!canGoPrev}
                onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
                style={[
                  styles.paginationBtn,
                  !canGoPrev && styles.paginationBtnDisabled,
                ]}
              >
                <ChevronLeft size={16} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.paginationBtnText}>Prev</Text>
              </Pressable>
              <Text style={styles.paginationLabel}>
                Page {pagination?.page ?? currentPage} of {totalPages}
              </Text>
              <Pressable
                disabled={!canGoNext}
                onPress={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                style={[
                  styles.paginationBtn,
                  !canGoNext && styles.paginationBtnDisabled,
                ]}
              >
                <Text style={styles.paginationBtnText}>Next</Text>
                <ChevronRight size={16} color={colors.primary} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>
        )}
      </AppRefreshableScrollView>

      <PermitDetailModal
        onClose={() => setSelectedPermitId(null)}
        permit={selectedPermitItem?.permit ?? null}
        student={selectedPermitItem?.student ?? null}
        visible={selectedPermitItem !== null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
    paddingBottom: spacing.xxl + 96,
  },
  /* ── Stat chips ── */
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statChip: {
    alignItems: "center",
    borderColor: colors.transparent,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  statCount: {
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  /* ── Filter tabs ── */
  filterRow: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 4,
    padding: 4,
  },
  filterTab: {
    borderRadius: radius.pill,
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  filterTabLabelActive: {
    color: colors.text,
    fontWeight: "800",
  },

  /* ── List ── */
  list: {
    gap: spacing.sm,
  },
  paginationRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  paginationBtn: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: `${colors.primary}30`,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  paginationBtnDisabled: {
    opacity: 0.5,
  },
  paginationBtnText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  paginationLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
});
