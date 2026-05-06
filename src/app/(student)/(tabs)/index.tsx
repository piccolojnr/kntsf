import { Href } from "expo-router";
import { CreditCard, FileText, ShieldAlert, User, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { NavigationListItem } from "@/components/ui/navigation-list-item";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";
import { CardStatus, StudentCard } from "@/features/cards/card-types";
import { useCards } from "@/features/cards/use-cards";
import { Permit, PermitStatus } from "@/features/permits/permit-types";
import { usePermits } from "@/features/permits/use-permits";
import { useCurrentStudent } from "@/features/students/use-current-student";

function formatDate(dateString?: string | null) {
  if (!dateString) return "Not available";
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPermitStatus(status?: PermitStatus | null) {
  switch (status) {
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "revoked":
      return "Revoked";
    default:
      return "No Permit";
  }
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

function getPermitTone(status?: PermitStatus | null) {
  if (status === "active") return "success" as const;
  if (status === "expired") return "warning" as const;
  if (status === "revoked") return "danger" as const;
  return "primary" as const;
}

function getCardTone(status?: CardStatus | null) {
  if (status === "active") return "success" as const;
  if (status === "lost" || status === "revoked" || status === "blocked") {
    return "danger" as const;
  }
  if (status === "replaced") return "warning" as const;
  return "primary" as const;
}

function getLatestPermit(permits: Permit[], studentId: string) {
  return (
    permits
      .filter((permit) => permit.studentId === studentId)
      .sort(
        (left, right) =>
          new Date(right.startDate).getTime() -
          new Date(left.startDate).getTime(),
      )[0] ?? null
  );
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

export default function StudentHomeScreen() {
  const studentQuery = useCurrentStudent();
  const permitsQuery = usePermits();
  const cardsQuery = useCards();

  const isLoading =
    studentQuery.isLoading || permitsQuery.isLoading || cardsQuery.isLoading;
  const hasError =
    studentQuery.isError || permitsQuery.isError || cardsQuery.isError;
  const student = studentQuery.student;
  const latestPermit = student
    ? getLatestPermit(permitsQuery.data ?? [], student.id)
    : null;
  const latestCard = student ? getLatestCard(cardsQuery.data ?? [], student.id) : null;

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Student"
          title={student ? `Hello, ${student.name.split(" ")[0]}` : "Student Home"}
          subtitle="Review your SRC permit and card status before entry."
        />

        {isLoading ? (
          <LoadingState message="Loading your student workspace..." />
        ) : hasError ? (
          <EmptyState
            description="Your student workspace could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load student home"
          />
        ) : !student ? (
          <EmptyState
            description="No linked student record was found for this account."
            icon={UserRound}
            title="Student record not found"
          />
        ) : (
          <>
            <View style={styles.statusGrid}>
              <StatusCard
                title="Current Permit"
                value={formatPermitStatus(latestPermit?.status)}
                description={
                  latestPermit
                    ? `Permit ${latestPermit.permitCode} expires ${formatDate(latestPermit.expiryDate)}.`
                    : "No permit has been issued for your student record yet."
                }
                tone={getPermitTone(latestPermit?.status)}
              />
              <StatusCard
                title="SRC Card"
                value={formatCardStatus(latestCard?.status)}
                description={
                  latestCard
                    ? `Registered ${formatDate(latestCard.registeredAt)}.`
                    : "No SRC card is currently registered to your account."
                }
                tone={getCardTone(latestCard?.status)}
              />
            </View>

            <SectionCard title="Quick Actions">
              <NavigationListItem
                href={"/(student)/permits" as Href}
                icon={FileText}
                label="View Permits"
                description="Open your active permit and permit history."
              />
              <NavigationListItem
                href={"/(student)/card" as Href}
                icon={CreditCard}
                label="View Card"
                description="Check your current SRC card status."
              />
              <NavigationListItem
                href={"/(student)/profile" as Href}
                icon={User}
                label="Profile"
                description="Review your student account details."
              />
            </SectionCard>
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
  statusGrid: {
    gap: spacing.md,
  },
});
