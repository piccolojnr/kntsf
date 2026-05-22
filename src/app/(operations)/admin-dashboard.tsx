import { ShieldCheck } from "lucide-react-native";

import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useOperationsSummary } from "@/features/operations/use-operations-summary";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

export default function AdminDashboardScreen() {
  const summaryQuery = useOperationsSummary();
  const refreshControl = usePullToRefresh(async () => {
    await summaryQuery.refetch();
  });

  const summary = summaryQuery.data;

  return (
    <AdminToolScreen
      title="Dashboard"
      subtitle="Review high-level operations metrics from the current workspace."
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
    >
      {summaryQuery.isLoading ? (
        <LoadingState message="Loading admin dashboard..." />
      ) : summaryQuery.isError || !summary ? (
        <EmptyState
          description="The admin dashboard data could not be loaded right now."
          icon={ShieldCheck}
          title="Unable to load dashboard"
        />
      ) : (
        <>
          <StatusCard
            title="Total Students"
            value={String(summary.totalStudents)}
            description="Student records currently available to operations."
            tone="primary"
          />
          <StatusCard
            title="Active Permits"
            value={String(summary.activePermits)}
            description="Permits that can currently pass verification."
            tone="success"
          />
          <StatusCard
            title="Registered Cards"
            value={String(summary.activeNfcCards)}
            description="Active card records available for NFC verification."
            tone="warning"
          />
          <StatusCard
            title="Today's Verifications"
            value={String(summary.verificationsToday)}
            description="Verification attempts logged today."
            tone="primary"
          />
          <StatusCard
            title="Failed Today"
            value={String(summary.failedVerificationsToday)}
            description="Verification attempts that did not pass today."
            tone="danger"
          />

          <SectionCard title="Admin Snapshot">
            <DetailRow
              label="Pending Requests"
              value={String(summary.pendingPermitRequests)}
              helper="Permit requests waiting for payment, review, or completion."
            />
            <DetailRow
              label="Paid Not Issued"
              value={String(summary.paidNotIssuedRequests)}
              helper="Paid requests that still need backend permit issuance."
            />
          </SectionCard>
        </>
      )}
    </AdminToolScreen>
  );
}
