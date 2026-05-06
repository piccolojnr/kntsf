import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { CreditCard, ShieldAlert, UserRound } from "lucide-react-native";

import { CardStatusBadge } from "@/components/cards/card-status-badge";
import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";
import { reportLostCardForStudent } from "@/features/cards/card-api";
import { CardStatus, StudentCard } from "@/features/cards/card-types";
import { useCards } from "@/features/cards/use-cards";
import { useCurrentStudent } from "@/features/students/use-current-student";

function formatDate(dateString?: string | null) {
  if (!dateString) return "Not registered";
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCardStatus(status?: CardStatus | null) {
  switch (status) {
    case "active":
      return "Active";
    case "lost":
      return "Lost";
    case "revoked":
      return "Revoked";
    case "blocked":
      return "Blocked";
    case "replaced":
      return "Replaced";
    default:
      return "Not Registered";
  }
}

function getCardTone(status?: CardStatus | null) {
  if (status === "active") return "success" as const;
  if (status === "lost" || status === "revoked" || status === "blocked") {
    return "danger" as const;
  }
  if (status === "replaced") return "warning" as const;
  return "primary" as const;
}

function getLatestCard(cards: StudentCard[], studentId: string) {
  return (
    cards
      .filter((card) => card.studentId === studentId)
      .sort(
        (left, right) =>
          new Date(right.registeredAt).getTime() -
          new Date(left.registeredAt).getTime(),
      )[0] ?? null
  );
}

export default function StudentCardScreen() {
  const queryClient = useQueryClient();
  const studentQuery = useCurrentStudent();
  const cardsQuery = useCards();
  const student = studentQuery.student;
  const latestCard = student ? getLatestCard(cardsQuery.data ?? [], student.id) : null;

  const reportLostMutation = useMutation({
    mutationFn: async () => {
      if (!student) {
        throw new Error("No student record is linked to this account.");
      }

      return reportLostCardForStudent(student.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      Alert.alert("Card Reported", "Your active card has been marked as lost.");
    },
    onError: (error) => {
      Alert.alert(
        "Unable to report card",
        error instanceof Error
          ? error.message
          : "Your card could not be reported as lost right now.",
      );
    },
  });

  const isLoading = studentQuery.isLoading || cardsQuery.isLoading;
  const hasError = studentQuery.isError || cardsQuery.isError;
  const canReportLost = latestCard?.status === "active";

  function handleReportLost() {
    Alert.alert(
      "Report Lost Card",
      "This will mark your active SRC card as lost in mock mode.",
      [
        { style: "cancel", text: "Cancel" },
        {
          style: "destructive",
          text: "Report Lost",
          onPress: () => reportLostMutation.mutate(),
        },
      ],
    );
  }

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Student"
          title="SRC Card"
          subtitle="Review your registered student card and report issues."
        />

        {isLoading ? (
          <LoadingState message="Loading your card..." />
        ) : hasError ? (
          <EmptyState
            description="Your card record could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load card"
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
              title="Card Status"
              value={formatCardStatus(latestCard?.status)}
              description={
                latestCard
                  ? `Registered ${formatDate(latestCard.registeredAt)}.`
                  : "No SRC card is currently registered to your student record."
              }
              tone={getCardTone(latestCard?.status)}
            />

            <SectionCard title="Card Details">
              <CardStatusBadge status={latestCard?.status ?? "none"} />
              <DetailRow
                label="Card UID"
                value={latestCard?.uid ?? "Not registered"}
                helper="Operations staff use this card UID for NFC verification."
              />
              <DetailRow
                label="Card Type"
                value={latestCard?.type.replaceAll("_", " ") ?? "Not available"}
              />
              <DetailRow
                label="Registered Date"
                value={formatDate(latestCard?.registeredAt)}
              />
            </SectionCard>

            <PrimaryButton
              disabled={!canReportLost}
              icon={CreditCard}
              label={canReportLost ? "Report Lost Card" : "No Active Card to Report"}
              loading={reportLostMutation.isPending}
              onPress={handleReportLost}
              variant={canReportLost ? "danger" : "primary"}
            />
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
