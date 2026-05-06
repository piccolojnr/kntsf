import { LogOut, ShieldAlert, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import { ProfileHeaderCard } from "@/components/cards/profile-header-card";
import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";
import { CardStatus, StudentCard } from "@/features/cards/card-types";
import { useCards } from "@/features/cards/use-cards";
import { Permit, PermitStatus } from "@/features/permits/permit-types";
import { usePermits } from "@/features/permits/use-permits";
import { useCurrentStudent } from "@/features/students/use-current-student";
import { useAuth } from "@/hooks/use-auth";

function formatDate(dateString?: string | null) {
  if (!dateString) return "Not available";
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return "Not recorded";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatCardStatus(status?: CardStatus | null) {
  switch (status) {
    case "active":
      return "Active";
    case "revoked":
      return "Revoked";
    case "lost":
      return "Lost";
    case "blocked":
      return "Blocked";
    case "replaced":
      return "Replaced";
    default:
      return "No Card";
  }
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

function getPermitTone(status?: PermitStatus | null) {
  switch (status) {
    case "active":
      return "success" as const;
    case "expired":
    case "revoked":
      return "warning" as const;
    default:
      return "primary" as const;
  }
}

function getCardTone(status?: CardStatus | null) {
  switch (status) {
    case "active":
      return "success" as const;
    case "revoked":
    case "blocked":
    case "lost":
      return "warning" as const;
    default:
      return "primary" as const;
  }
}

function getLatestPermit(permits: Permit[], studentId: string) {
  return (
    permits
      .filter((permit) => permit.studentId === studentId)
      .sort(
        (left, right) =>
          new Date(right.startDate).getTime() - new Date(left.startDate).getTime(),
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

export default function StudentProfileScreen() {
  const { logout, user } = useAuth();
  const studentQuery = useCurrentStudent();
  const cardsQuery = useCards();
  const permitsQuery = usePermits();

  const isLoading =
    studentQuery.isLoading || cardsQuery.isLoading || permitsQuery.isLoading;
  const hasError =
    studentQuery.isError || cardsQuery.isError || permitsQuery.isError;

  const student = studentQuery.student;
  const latestCard = student
    ? getLatestCard(cardsQuery.data ?? [], student.id)
    : null;
  const latestPermit = student
    ? getLatestPermit(permitsQuery.data ?? [], student.id)
    : null;

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Student"
          subtitle="Review your account, permit record, and SRC card details."
          title="Profile"
        />
        {isLoading ? (
          <LoadingState message="Loading your profile..." />
        ) : hasError ? (
          <EmptyState
            description="Your student profile could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load profile"
          />
        ) : !student ? (
          <EmptyState
            description="No linked student record was found for this account."
            icon={UserRound}
            title="Student record not found"
          />
        ) : (
          <>
            <ProfileHeaderCard
              email={student.email}
              name={student.name}
              role={user?.role ?? "student"}
              subtitle="Your student workspace keeps your permit and SRC card access in one place."
              workspaceLabel="Student"
            />

            <View style={styles.statusGrid}>
              <StatusCard
                title="Permit Status"
                value={formatPermitStatus(latestPermit?.status)}
                description={
                  latestPermit
                    ? `Permit ${latestPermit.permitCode} expires ${formatDate(latestPermit.expiryDate)}.`
                    : "No permit record is currently linked to your student account."
                }
                tone={getPermitTone(latestPermit?.status)}
              />
              <StatusCard
                title="SRC Card"
                value={formatCardStatus(latestCard?.status)}
                description={
                  latestCard
                    ? `Card UID ${latestCard.uid} was registered ${formatDate(latestCard.registeredAt)}.`
                    : "No SRC card record is currently linked to your student account."
                }
                tone={getCardTone(latestCard?.status)}
              />
            </View>

            <SectionCard title="Account Overview">
              <DetailRow
                label="Student ID"
                value={student.studentId}
                helper="Use this student ID when operations staff verify your permit."
              />
              <DetailRow
                label="Course"
                value={student.course}
                helper={`Current academic level: ${student.level}.`}
              />
              <DetailRow
                label="Phone"
                value={student.phone}
                helper="This contact is attached to your student record."
              />
              <DetailRow
                label="Sign-in Email"
                value={user?.email ?? student.email}
                helper="Your current app sign-in identity."
              />
            </SectionCard>

            <SectionCard title="Permit Record">
              <DetailRow
                label="Permit Code"
                value={latestPermit?.permitCode ?? "No Permit"}
                helper={
                  latestPermit
                    ? `Permit window: ${formatDate(latestPermit.startDate)} to ${formatDate(latestPermit.expiryDate)}.`
                    : "A permit record has not been issued for this student yet."
                }
              />
              <DetailRow
                label="Amount Paid"
                value={formatCurrency(latestPermit?.amountPaid)}
                helper={
                  latestPermit
                    ? `Current status: ${formatPermitStatus(latestPermit.status)}.`
                    : "No payment record is available without an issued permit."
                }
              />
            </SectionCard>

            <SectionCard title="Card Record">
              <DetailRow
                label="Card UID"
                value={latestCard?.uid ?? "No Card"}
                helper={
                  latestCard
                    ? `Card type: ${latestCard.type.replaceAll("_", " ")}.`
                    : "No card UID has been assigned to this student."
                }
              />
              <DetailRow
                label="Registered"
                value={formatDate(latestCard?.registeredAt)}
                helper={`Current card status: ${formatCardStatus(latestCard?.status)}.`}
              />
            </SectionCard>

            <PrimaryButton
              label="Logout"
              icon={LogOut}
              onPress={logout}
              variant="danger"
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
    paddingBottom: spacing.xxl + 72,
  },
  statusGrid: {
    gap: spacing.md,
  },
});
