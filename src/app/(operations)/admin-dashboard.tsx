import { ShieldCheck } from "lucide-react-native";

import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useCards } from "@/features/cards/use-cards";
import { usePermits } from "@/features/permits/use-permits";
import { getVerificationLogs } from "@/features/operations/verification-api";
import { useStudents } from "@/features/students/use-students";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useQuery } from "@tanstack/react-query";

function isToday(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function AdminDashboardScreen() {
  const studentsQuery = useStudents();
  const permitsQuery = usePermits();
  const cardsQuery = useCards();
  const logsQuery = useQuery({
    queryKey: ["verification-logs"],
    queryFn: getVerificationLogs,
  });
  const refreshControl = usePullToRefresh(async () => {
    await Promise.all([
      studentsQuery.refetch(),
      permitsQuery.refetch(),
      cardsQuery.refetch(),
      logsQuery.refetch(),
    ]);
  });

  const isLoading =
    studentsQuery.isLoading ||
    permitsQuery.isLoading ||
    cardsQuery.isLoading ||
    logsQuery.isLoading;
  const hasError =
    studentsQuery.isError ||
    permitsQuery.isError ||
    cardsQuery.isError ||
    logsQuery.isError;

  const students = studentsQuery.data ?? [];
  const permits = permitsQuery.data ?? [];
  const cards = cardsQuery.data ?? [];
  const logs = logsQuery.data ?? [];

  const activePermits = permits.filter((permit) => permit.status === "active");
  const registeredCards = cards.filter((card) => card.status === "active");
  const inactiveCards = cards.filter(
    (card) => card.status === "revoked" || card.status === "lost",
  );
  const todayVerifications = logs.filter((log) => isToday(log.checkedAt));

  return (
    <AdminToolScreen
      title="Dashboard"
      subtitle="Review high-level operations metrics from the current workspace."
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
    >
      {isLoading ? (
        <LoadingState message="Loading admin dashboard..." />
      ) : hasError ? (
        <EmptyState
          description="The admin dashboard data could not be loaded right now."
          icon={ShieldCheck}
          title="Unable to load dashboard"
        />
      ) : (
        <>
          <StatusCard
            title="Total Students"
            value={String(students.length)}
            description="Student records currently available to operations."
            tone="primary"
          />
          <StatusCard
            title="Active Permits"
            value={String(activePermits.length)}
            description="Permits that can currently pass verification."
            tone="success"
          />
          <StatusCard
            title="Registered Cards"
            value={String(registeredCards.length)}
            description="Active card records available for NFC verification."
            tone="warning"
          />
          <StatusCard
            title="Today's Verifications"
            value={String(todayVerifications.length)}
            description="Verification attempts logged today."
            tone="primary"
          />
          <StatusCard
            title="Revoked/Lost Cards"
            value={String(inactiveCards.length)}
            description="Cards that should not grant access."
            tone="danger"
          />

          <SectionCard title="Admin Snapshot">
            <DetailRow
              label="Permit Records"
              value={String(permits.length)}
              helper="Includes active, expired, and revoked permit records."
            />
            <DetailRow
              label="Verification Logs"
              value={String(logs.length)}
              helper="Includes student ID and card UID verification attempts."
            />
          </SectionCard>
        </>
      )}
    </AdminToolScreen>
  );
}
