import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Search as SearchIcon,
  ShieldAlert,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchField } from "@/components/ui/search-field";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  getVerificationLogsPage,
  VerificationLogItem,
} from "@/features/operations/audit-api";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { queryKeys } from "@/lib/api/query-keys";

const PAGE_SIZE = 15;

function formatDateTime(dateString: string) {
  if (!dateString) {
    return "";
  }
  return new Date(dateString).toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getResultTone(result: VerificationLogItem["result"]) {
  switch (result) {
    case "valid":
      return colors.success;
    case "warning":
      return colors.warning;
    case "denied":
      return colors.danger;
    default:
      return colors.primary;
  }
}

function formatMethod(method: string) {
  switch (method) {
    case "nfc":
      return "NFC Card Scan";
    case "student_number":
      return "Student ID Lookup";
    case "permit_code":
      return "Permit Code Lookup";
    default:
      return method;
  }
}

function formatResult(result: string) {
  switch (result) {
    case "valid":
      return "Valid";
    case "denied":
      return "Denied";
    case "warning":
      return "Warning";
    default:
      return result;
  }
}

export default function OperationsAuditLogsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const logsQuery = useQuery({
    queryKey: queryKeys.operations.auditLogs({
      search: searchTerm,
      page: currentPage,
    }),
    queryFn: () =>
      getVerificationLogsPage({
        search: searchTerm,
        page: currentPage,
        limit: PAGE_SIZE,
      }),
  });

  const refreshControl = usePullToRefresh(async () => {
    await logsQuery.refetch();
  });

  const auditLogs = useMemo(
    () => logsQuery.data?.items ?? [],
    [logsQuery.data?.items],
  );

  const pagination = logsQuery.data?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <AdminToolScreen
      onRefresh={refreshControl.onRefresh}
      refreshing={refreshControl.refreshing}
      subtitle="Review protected actions and verification activity in the operations workspace."
      title="Audit Logs"
    >
      <SearchField
        onChangeText={setSearchTerm}
        placeholder="Search by student name or ID…"
        value={searchTerm}
      />

      {logsQuery.isLoading ? (
        <LoadingState message="Loading audit logs..." />
      ) : logsQuery.isError ? (
        <EmptyState
          description={String(logsQuery.error)}
          icon={ShieldAlert}
          title="Unable to load audit logs"
        />
      ) : auditLogs.length === 0 ? (
        <EmptyState
          description="No audit entries matched your search."
          icon={SearchIcon}
          title="No audit logs found"
        />
      ) : (
        <View style={styles.timeline}>
          {auditLogs.map((log) => {
            const toneColor = getResultTone(log.result);

            return (
              <View key={log.id} style={styles.logRow}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: `${toneColor}22` },
                  ]}
                >
                  <FileCheck2
                    color={toneColor}
                    size={17}
                    strokeWidth={2.4}
                  />
                </View>
                <View style={styles.logBody}>
                  <View style={styles.logHeader}>
                    <Text style={styles.action} numberOfLines={1}>
                      {formatMethod(log.method)}
                    </Text>
                    <View
                      style={[
                        styles.resultBadge,
                        { backgroundColor: `${toneColor}22` },
                      ]}
                    >
                      <Text style={[styles.resultLabel, { color: toneColor }]}>
                        {formatResult(log.result)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.student}>
                    {log.student?.name ?? "Unknown"}
                    {log.student?.student_number
                      ? ` · ${log.student.student_number}`
                      : ""}
                  </Text>
                  <Text style={styles.verifier}>
                    by {log.verifier?.name ?? "System"}
                    {" · "}
                    {formatDateTime(log.createdAt)}
                  </Text>
                  {log.reason ? (
                    <Text style={styles.reason}>{log.reason}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}

          <View style={styles.paginationRow}>
            <Pressable
              disabled={!canGoPrev}
              onPress={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              style={[
                styles.paginationBtn,
                !canGoPrev && styles.paginationBtnDisabled,
              ]}
            >
              <ChevronLeft
                size={16}
                color={colors.primary}
                strokeWidth={2.2}
              />
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
              <ChevronRight
                size={16}
                color={colors.primary}
                strokeWidth={2.2}
              />
            </Pressable>
          </View>
        </View>
      )}
    </AdminToolScreen>
  );
}

const styles = StyleSheet.create({
  timeline: {
    gap: spacing.md,
  },
  logRow: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  logBody: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  logHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  action: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: "800",
    lineHeight: fontSizes.md * 1.4,
  },
  resultBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
    lineHeight: 11 * 1.5,
    textTransform: "uppercase",
  },
  student: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    lineHeight: fontSizes.xs * 1.5,
  },
  verifier: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    lineHeight: fontSizes.xs * 1.5,
  },
  reason: {
    color: colors.warning,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    lineHeight: fontSizes.xs * 1.5,
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
    lineHeight: fontSizes.sm * 1.5,
  },
  paginationLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    lineHeight: fontSizes.sm * 1.5,
  },
});
