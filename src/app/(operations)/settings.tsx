import { useQuery } from "@tanstack/react-query";
import { Settings, ShieldAlert } from "lucide-react-native";
import { StyleSheet, Switch, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { getOperationsPermitIssuanceConfig } from "@/features/permits/permit-api";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function formatCurrency(amount: number) {
  return `GHS ${amount.toFixed(2)}`;
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "Unavailable";
  }

  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OperationsSettingsScreen() {
  const configQuery = useQuery({
    queryKey: ["operations-permit-issuance-config"],
    queryFn: () => getOperationsPermitIssuanceConfig(),
  });
  const refreshControl = usePullToRefresh(async () => {
    await configQuery.refetch();
  });

  const config = configQuery.data;

  return (
    <AdminToolScreen
      title="Settings"
      subtitle="Inspect permit issuance configuration for this workspace."
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
    >
      {configQuery.isLoading ? (
        <LoadingState message="Loading permit settings..." />
      ) : configQuery.isError || !config ? (
        <EmptyState
          description="Permit issuance settings could not be loaded right now."
          icon={ShieldAlert}
          title="Unable to load settings"
        />
      ) : (
        <>
          <SectionCard title="Permit Issuance">
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Issuance Enabled</Text>
                <Text style={styles.settingHelper}>
                  Backend configuration controls mobile permit issuing.
                </Text>
              </View>
              <Switch
                disabled
                thumbColor={config.enabled ? colors.primary : colors.border}
                trackColor={{
                  false: colors.surfaceMuted,
                  true: colors.primarySoft,
                }}
                value={config.enabled}
              />
            </View>
            <DetailRow
              label="Academic Year"
              value={config.academicYear ?? "Unavailable"}
              helper="Applied automatically when a permit is issued."
            />
            {config.semester ? (
              <DetailRow
                label="Semester"
                value={config.semester}
                helper="Applied automatically when a permit is issued."
              />
            ) : null}
            <DetailRow
              label="Default Amount"
              value={formatCurrency(config.defaultAmount)}
              helper="Staff do not enter amounts in the mobile workflow."
            />
            <DetailRow
              label="Expiry Date"
              value={formatDate(config.expiryDate)}
              helper="All newly issued permits use this expiry date."
            />
            {config.validityDays ? (
              <DetailRow
                label="Validity Days"
                value={String(config.validityDays)}
                helper="Default permit validity returned by the operations API."
              />
            ) : null}
            {config.studentNumberPrefix ? (
              <DetailRow
                label="Student Prefix"
                value={config.studentNumberPrefix}
                helper="Default student number prefix used by operations forms."
              />
            ) : null}
          </SectionCard>

          <View style={styles.notice}>
            <Settings color={colors.warning} size={18} strokeWidth={2.4} />
            <Text style={styles.noticeText}>
              These settings are read-only in the mobile app for now. Production
              changes should come from the backend dashboard.
            </Text>
          </View>
        </>
      )}
    </AdminToolScreen>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  settingCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  settingTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  settingHelper: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  notice: {
    alignItems: "flex-start",
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
