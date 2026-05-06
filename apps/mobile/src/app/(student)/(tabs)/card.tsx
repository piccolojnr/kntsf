import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, ShieldAlert, UserRound } from "lucide-react-native";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import StudentIDCard from "@/components/cards/student-id-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
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

function formatCardType(type: StudentCard["type"]) {
  switch (type) {
    case "mifare_classic":
      return "MIFARE Classic";
    case "ntag216":
      return "NTAG216";
    default:
      return "Unknown";
  }
}

function getLatestCard(cards: StudentCard[], studentId: string) {
  return (
    cards
      .filter((c) => c.studentId === studentId)
      .sort(
        (a, b) =>
          new Date(b.registeredAt).getTime() -
          new Date(a.registeredAt).getTime(),
      )[0] ?? null
  );
}

function CardDetailRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && styles.detailValueAccent]}>
        {value}
      </Text>
    </View>
  );
}

function CardStatusRow({ status }: { status: CardStatus | null }) {
  const isActive = status === "active";
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Not registered";

  const badgeStyle = isActive ? styles.badgeActive : styles.badgeInactive;
  const dotStyle = isActive ? styles.dotActive : styles.dotInactive;
  const textStyle = isActive
    ? styles.badgeTextActive
    : styles.badgeTextInactive;

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>Status</Text>
      <View style={[styles.statusBadge, badgeStyle]}>
        <View style={[styles.statusDot, dotStyle]} />
        <Text style={[styles.statusBadgeText, textStyle]}>
          {label.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

export default function StudentCardScreen() {
  const queryClient = useQueryClient();
  const studentQuery = useCurrentStudent();
  const cardsQuery = useCards();
  const student = studentQuery.student;
  const latestCard = student
    ? getLatestCard(cardsQuery.data ?? [], student.id)
    : null;

  const reportLostMutation = useMutation({
    mutationFn: async () => {
      if (!student)
        throw new Error("No student record linked to this account.");
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
      "This will mark your active SRC card as lost. This action cannot be undone.",
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
          subtitle="Your NFC student card and registration details."
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
            {/* NFC card hero */}
            <StudentIDCard
              student={{
                name: student.name,
                studentId: student.studentId,
                programme: student.course,
                level: student.level,
                validUntil: latestCard
                  ? formatDate(latestCard.registeredAt)
                  : undefined,
                status: latestCard
                  ? (latestCard.status as CardStatus)
                  : undefined,
              }}
            />

            {/* Card details */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Card Details</Text>
              <View style={styles.detailsList}>
                <CardDetailRow
                  label="Card UID"
                  value={latestCard?.uid ?? "Not registered"}
                />
                <CardDetailRow
                  label="Card Type"
                  value={latestCard ? formatCardType(latestCard.type) : "N/A"}
                />
                <CardDetailRow
                  label="Registered Date"
                  value={formatDate(latestCard?.registeredAt)}
                />
                <CardStatusRow status={latestCard?.status ?? null} />
              </View>
            </View>

            {/* Report lost */}
            <PrimaryButton
              disabled={!canReportLost}
              icon={CreditCard}
              label={
                canReportLost ? "Report Lost Card" : "No Active Card to Report"
              }
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

  // ── Details card ───────────────────────────────────────
  detailsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  detailsTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  detailsList: {
    gap: spacing.md,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  detailValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  detailValueAccent: {
    color: colors.primary,
  },

  // Status badge
  statusBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeActive: {
    backgroundColor: colors.successSoft,
  },
  badgeInactive: {
    backgroundColor: colors.dangerSoft,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dotActive: { backgroundColor: colors.success },
  dotInactive: { backgroundColor: colors.danger },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  badgeTextActive: { color: colors.success },
  badgeTextInactive: { color: colors.danger },
});
