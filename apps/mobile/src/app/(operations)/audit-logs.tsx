import { useQuery } from "@tanstack/react-query";
import { FileCheck2, ShieldAlert } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { AppRefreshControl } from "@/components/ui/app-refresh-control";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { AuditLogItem, getAuditLogs } from "@/features/operations/audit-api";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getToneColor(tone: AuditLogItem["tone"]) {
  switch (tone) {
    case "success":
      return colors.success;
    case "warning":
      return colors.warning;
    case "danger":
      return colors.danger;
    default:
      return colors.primary;
  }
}

export default function OperationsAuditLogsScreen() {
  const logsQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: getAuditLogs,
  });
  const refreshControl = usePullToRefresh(async () => {
    await logsQuery.refetch();
  });
  const auditLogs = logsQuery.data ?? [];

  return (
    <AdminToolScreen
      title="Audit Logs"
      subtitle="Review protected actions and verification activity in the operations workspace."
      refreshControl={<AppRefreshControl {...refreshControl} />}
    >
      {logsQuery.isLoading ? (
        <LoadingState message="Loading audit logs..." />
      ) : logsQuery.isError ? (
        <EmptyState
          description="Audit activity could not be loaded right now."
          icon={ShieldAlert}
          title="Unable to load audit logs"
        />
      ) : (
        <View style={styles.timeline}>
          {auditLogs.map((log) => {
            const toneColor = getToneColor(log.tone);

            return (
              <View key={log.id} style={styles.logRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${toneColor}22` }]}>
                  <FileCheck2 color={toneColor} size={17} strokeWidth={2.4} />
                </View>
                <View style={styles.logBody}>
                  <View style={styles.logHeader}>
                    <Text style={styles.action}>{log.action}</Text>
                    <Text style={styles.timestamp}>
                      {formatDateTime(log.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.actor}>{log.actor}</Text>
                  <Text style={styles.detail}>{log.detail}</Text>
                </View>
              </View>
            );
          })}
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
    gap: 2,
  },
  action: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
  actor: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detail: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
