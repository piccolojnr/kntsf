import { ShieldAlert } from "lucide-react-native";

import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { isAdmin } from "@/features/auth/auth-permissions";
import { useOperationsSummary } from "@/features/operations/use-operations-summary";
import { useAuth } from "@/hooks/use-auth";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

export default function OperationsReportsScreen() {
  const { user } = useAuth();
  const canViewSummary = isAdmin(user);
  const summaryQuery = useOperationsSummary({ enabled: canViewSummary });
  const refreshControl = usePullToRefresh(async () => {
    if (canViewSummary) {
      await summaryQuery.refetch();
    }
  });

  const summary = summaryQuery.data;

  return (
    <AdminToolScreen
      title="Reports"
      subtitle="Read simple operational summaries before charting is added."
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
    >
      {!canViewSummary ? (
        <EmptyState
          description="You do not have permission to view operations reports."
          icon={ShieldAlert}
          title="Admin access required"
        />
      ) : summaryQuery.isLoading ? (
        <LoadingState message="Loading reports..." />
      ) : summaryQuery.isError || !summary ? (
        <EmptyState
          description="Report data could not be loaded right now."
          icon={ShieldAlert}
          title="Unable to load reports"
        />
      ) : (
        <>
          <StatusCard
            title="Active Permits"
            value={String(summary.activePermits)}
            description="Permits currently valid for verification."
            tone="primary"
          />
          <StatusCard
            title="Today's Verifications"
            value={String(summary.verificationsToday)}
            description="Verification attempts logged today."
            tone="success"
          />
          <StatusCard
            title="Failed Today"
            value={String(summary.failedVerificationsToday)}
            description="Verification attempts that require follow-up today."
            tone="warning"
          />
          <StatusCard
            title="Cards Registered"
            value={String(summary.activeNfcCards)}
            description="Active cards currently linked to student records."
            tone="success"
          />
          <StatusCard
            title="Paid Not Issued"
            value={String(summary.paidNotIssuedRequests)}
            description="Paid permit requests waiting for issuance."
            tone="danger"
          />

          <SectionCard title="Report Notes">
            <DetailRow
              label="Pending Requests"
              value={String(summary.pendingPermitRequests)}
              helper="Requests still waiting for payment, review, or completion."
            />
            <DetailRow
              label="Backend Source"
              value="Operations Summary"
              helper="Reports use the Laravel mobile operations summary endpoint."
            />
          </SectionCard>
        </>
      )}
    </AdminToolScreen>
  );
}
