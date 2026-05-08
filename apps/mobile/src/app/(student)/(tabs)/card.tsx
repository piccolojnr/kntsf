import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Nfc, ShieldAlert, UserRound } from "lucide-react-native";
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
import { useStudentCard } from "@/features/cards/use-student-card";
import { useCurrentStudent } from "@/features/students/use-current-student";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Card Details Panel ───────────────────────────────────────────────────────

const CARD_STATUS_COLOR: Record<CardStatus, string> = {
  active: colors.success,
  inactive: colors.textMuted,
  blocked: colors.danger,
  revoked: colors.danger,
  lost: colors.warning,
  stolen: colors.danger,
  replaced: colors.warning,
  damaged: colors.warning,
};
const CARD_STATUS_SOFT: Record<CardStatus, string> = {
  active: colors.successSoft,
  inactive: colors.surfaceMuted,
  blocked: colors.dangerSoft,
  revoked: colors.dangerSoft,
  lost: colors.warningSoft,
  stolen: colors.dangerSoft,
  replaced: colors.warningSoft,
  damaged: colors.warningSoft,
};

function CardDetailsPanel({ card }: { card: StudentCard | null }) {
  const status: CardStatus | null = card?.status ?? null;
  const statusColor = status ? CARD_STATUS_COLOR[status] : colors.textMuted;
  const statusSoft = status ? CARD_STATUS_SOFT[status] : colors.surfaceMuted;

  return (
    <View style={panelStyles.card}>
      <View style={panelStyles.inner}>
        {/* Header */}
        <View style={panelStyles.header}>
          <Text style={panelStyles.title}>NFC Card Details</Text>
          <View
            style={[panelStyles.statusBadge, { backgroundColor: statusSoft }]}
          >
            <View
              style={[panelStyles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[panelStyles.statusText, { color: statusColor }]}>
              {status ? status.toUpperCase() : "NOT REGISTERED"}
            </Text>
          </View>
        </View>

        {/* UID display block */}
        <View style={panelStyles.uidBlock}>
          <View style={panelStyles.uidLeft}>
            <Text style={panelStyles.uidLabel}>CARD UID</Text>
            <Text style={panelStyles.uidValue} numberOfLines={1}>
              {card?.uid ?? "—"}
            </Text>
          </View>
          <View
            style={[
              panelStyles.nfcIcon,
              {
                backgroundColor: `${statusColor}15`,
                borderColor: `${statusColor}30`,
              },
            ]}
          >
            <Nfc size={22} color={statusColor} strokeWidth={1.5} />
          </View>
        </View>

        {/* 2-column grid */}
        <View style={panelStyles.grid}>
          <DetailCell
            label="Card Type"
            value={card ? formatCardType(card.type) : "—"}
          />
          <DetailCell
            label="Registered"
            value={formatDate(card?.registeredAt)}
          />
        </View>
      </View>
    </View>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={panelStyles.cell}>
      <Text style={panelStyles.cellLabel}>{label}</Text>
      <Text style={panelStyles.cellValue}>{value}</Text>
    </View>
  );
}

const panelStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentStripe: {
    borderBottomLeftRadius: radius.lg,
    borderTopLeftRadius: radius.lg,
    width: 4,
  },
  inner: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  uidBlock: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  uidLeft: { flex: 1, gap: 4, paddingRight: spacing.md },
  uidLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "600",
    letterSpacing: 1.4,
  },
  uidValue: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  nfcIcon: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cell: {
    flex: 1,
    gap: 4,
  },
  cellLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  cellValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StudentCardScreen() {
  const queryClient = useQueryClient();
  const studentQuery = useCurrentStudent();
  const student = studentQuery.student;
  const cardQuery = useStudentCard(student?.id);
  const latestCard = cardQuery.data ?? null;

  const reportLostMutation = useMutation({
    mutationFn: async () => {
      if (!student)
        throw new Error("No student record linked to this account.");
      return reportLostCardForStudent(student.studentId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-card"] });
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

  const isLoading = studentQuery.isLoading || cardQuery.isLoading;
  const hasError = studentQuery.isError || cardQuery.isError;
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
            {/* Bold ID card hero */}
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

            {/* Card details panel */}
            <CardDetailsPanel card={latestCard} />

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
});
