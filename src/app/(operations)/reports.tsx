import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react-native";

import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { AppRefreshControl } from "@/components/ui/app-refresh-control";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useCards } from "@/features/cards/use-cards";
import { getVerificationLogs } from "@/features/operations/verification-api";
import { usePermits } from "@/features/permits/use-permits";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

export default function OperationsReportsScreen() {
  const permitsQuery = usePermits();
  const cardsQuery = useCards();
  const logsQuery = useQuery({
    queryKey: ["verification-logs"],
    queryFn: getVerificationLogs,
  });
  const refreshControl = usePullToRefresh(async () => {
    await Promise.all([
      permitsQuery.refetch(),
      cardsQuery.refetch(),
      logsQuery.refetch(),
    ]);
  });

  const isLoading =
    permitsQuery.isLoading || cardsQuery.isLoading || logsQuery.isLoading;
  const hasError =
    permitsQuery.isError || cardsQuery.isError || logsQuery.isError;

  const permits = permitsQuery.data ?? [];
  const cards = cardsQuery.data ?? [];
  const logs = logsQuery.data ?? [];

  const issuedPermits = permits.filter(
    (permit) => permit.status === "active" || permit.status === "expired",
  );
  const allowedVerifications = logs.filter(
    (log) => log.outcome === "allowed",
  );
  const deniedVerifications = logs.filter(
    (log) => log.outcome !== "allowed",
  );
  const registeredCards = cards.filter((card) => card.status === "active");
  const revokedCards = cards.filter(
    (card) => card.status === "revoked" || card.status === "lost",
  );

  return (
    <AdminToolScreen
      title="Reports"
      subtitle="Read simple operational summaries before charting is added."
      refreshControl={<AppRefreshControl {...refreshControl} />}
    >
      {isLoading ? (
        <LoadingState message="Loading reports..." />
      ) : hasError ? (
        <EmptyState
          description="Report data could not be loaded right now."
          icon={ShieldAlert}
          title="Unable to load reports"
        />
      ) : (
        <>
          <StatusCard
            title="Permits Issued"
            value={String(issuedPermits.length)}
            description="Active and expired permits currently on record."
            tone="primary"
          />
          <StatusCard
            title="Allowed Verifications"
            value={String(allowedVerifications.length)}
            description="Verification attempts that granted access."
            tone="success"
          />
          <StatusCard
            title="Denied/Warning Verifications"
            value={String(deniedVerifications.length)}
            description="Verification attempts that required follow-up."
            tone="warning"
          />
          <StatusCard
            title="Cards Registered"
            value={String(registeredCards.length)}
            description="Active cards currently linked to student records."
            tone="success"
          />
          <StatusCard
            title="Cards Revoked/Lost"
            value={String(revokedCards.length)}
            description="Cards removed from active verification use."
            tone="danger"
          />

          <SectionCard title="Report Notes">
            <DetailRow
              label="Charts"
              value="Not added yet"
              helper="This screen intentionally shows summaries only until charting is added."
            />
            <DetailRow
              label="Backend Source"
              value="Mobile APIs"
              helper="Reports are calculated from backend mobile operations endpoints."
            />
          </SectionCard>
        </>
      )}
    </AdminToolScreen>
  );
}
