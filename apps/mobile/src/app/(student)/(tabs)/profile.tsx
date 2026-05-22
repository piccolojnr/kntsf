import { LogOut, Nfc, ShieldAlert, UserRound } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { CardStatus } from "@/features/cards/card-types";
import { useStudentNfcCard } from "@/features/cards/use-student-card";
import { Permit, PermitStatus } from "@/features/permits/permit-types";
import { useStudentPermits } from "@/features/permits/use-student-permits";
import { useCurrentStudent } from "@/features/students/use-current-student";
import { useAuth } from "@/hooks/use-auth";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

function getLatestPermit(permits: Permit[]) {
  return (
    permits
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      )[0] ?? null
  );
}

// ─── Status configs ───────────────────────────────────────────────────────────

const PERMIT_COLOR: Record<PermitStatus, string> = {
  active: colors.success,
  expired: colors.warning,
  revoked: colors.danger,
};
const PERMIT_SOFT: Record<PermitStatus, string> = {
  active: colors.successSoft,
  expired: colors.warningSoft,
  revoked: colors.dangerSoft,
};

const CARD_COLOR: Record<CardStatus, string> = {
  active: colors.success,
  inactive: colors.textMuted,
  blocked: colors.danger,
  revoked: colors.danger,
  lost: colors.warning,
  stolen: colors.danger,
  replaced: colors.warning,
  damaged: colors.warning,
};
const CARD_SOFT: Record<CardStatus, string> = {
  active: colors.successSoft,
  inactive: colors.surfaceMuted,
  blocked: colors.dangerSoft,
  revoked: colors.dangerSoft,
  lost: colors.warningSoft,
  stolen: colors.dangerSoft,
  replaced: colors.warningSoft,
  damaged: colors.warningSoft,
};

// ─── Profile hero card ────────────────────────────────────────────────────────

function ProfileHeroCard({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
  return (
    <View style={heroStyles.card}>
      {/* Avatar */}
      <View style={heroStyles.avatarWrap}>
        <Text style={heroStyles.avatarText}>{getInitials(name)}</Text>
      </View>

      {/* Identity */}
      <View style={heroStyles.identity}>
        <Text style={heroStyles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={heroStyles.email} numberOfLines={1}>
          {email}
        </Text>
        <View style={heroStyles.badgeRow}>
          <View style={heroStyles.roleBadge}>
            <Text style={heroStyles.roleBadgeText}>{role.toUpperCase()}</Text>
          </View>
          <View style={heroStyles.workspaceBadge}>
            <Text style={heroStyles.workspaceBadgeText}>STUDENT</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  card: {
    backgroundColor: "#0a1628",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#1e3a5f33",
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#1f4b9966",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: fontSizes.xl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  identity: {
    flex: 1,
    gap: 5,
  },
  name: {
    color: "#ffffff",
    fontSize: fontSizes.lg,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  email: {
    color: "rgba(255,255,255,0.40)",
    fontSize: fontSizes.xs,
    fontWeight: "500",
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  roleBadgeText: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  workspaceBadge: {
    backgroundColor: `${colors.primary}55`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  workspaceBadgeText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
});

// ─── Status chip pair ─────────────────────────────────────────────────────────

function StatusChipPair({
  permitStatus,
  cardStatus,
}: {
  permitStatus: PermitStatus | null;
  cardStatus: CardStatus | null;
}) {
  const pColor = permitStatus ? PERMIT_COLOR[permitStatus] : colors.textMuted;
  const pSoft = permitStatus ? PERMIT_SOFT[permitStatus] : colors.surfaceMuted;
  const cColor = cardStatus ? CARD_COLOR[cardStatus] : colors.textMuted;
  const cSoft = cardStatus ? CARD_SOFT[cardStatus] : colors.surfaceMuted;

  return (
    <View style={chipPairStyles.row}>
      <StatusChip
        label="Permit"
        value={
          permitStatus
            ? permitStatus.charAt(0).toUpperCase() + permitStatus.slice(1)
            : "None"
        }
        color={pColor}
        soft={pSoft}
      />
      <StatusChip
        label="SRC Card"
        value={
          cardStatus
            ? cardStatus.charAt(0).toUpperCase() + cardStatus.slice(1)
            : "None"
        }
        color={cColor}
        soft={cSoft}
        icon={<Nfc size={14} color={cColor} strokeWidth={1.5} />}
      />
    </View>
  );
}

function StatusChip({
  label,
  value,
  color,
  soft,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  soft: string;
  icon?: React.ReactNode;
}) {
  return (
    <View
      style={[
        chipPairStyles.chip,
        { backgroundColor: soft, borderColor: `${color}40` },
      ]}
    >
      <View style={chipPairStyles.chipTop}>
        <Text style={[chipPairStyles.chipLabel, { color }]}>
          {label.toUpperCase()}
        </Text>
        {icon}
      </View>
      <Text style={[chipPairStyles.chipValue, { color }]}>{value}</Text>
    </View>
  );
}

const chipPairStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: 6,
  },
  chipTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chipLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  chipValue: {
    fontSize: fontSizes.md,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});

// ─── Info panel (replaces SectionCard) ───────────────────────────────────────

function InfoPanel({
  title,
  accentColor,
  rows,
}: {
  title: string;
  accentColor?: string;
  rows: { label: string; value: string; sub?: string }[];
}) {
  return (
    <View style={panelStyles.card}>
      <View style={panelStyles.inner}>
        <Text style={panelStyles.title}>{title}</Text>
        <View style={panelStyles.rows}>
          {rows.map((row, i) => (
            <View
              key={i}
              style={[
                panelStyles.row,
                i < rows.length - 1 && panelStyles.rowBorder,
              ]}
            >
              <Text style={panelStyles.rowLabel}>{row.label}</Text>
              <View style={panelStyles.rowRight}>
                <Text style={panelStyles.rowValue}>{row.value}</Text>
                {row.sub ? (
                  <Text style={panelStyles.rowSub}>{row.sub}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stripe: {
    width: 4,
  },
  inner: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
  rows: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.sm + 2,
  },
  rowBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    flex: 1,
    paddingRight: spacing.sm,
  },
  rowRight: {
    flex: 2,
    alignItems: "flex-end",
    gap: 2,
  },
  rowValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    textAlign: "right",
  },
  rowSub: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    textAlign: "right",
    lineHeight: 16,
  },
});

// ─── Logout button ────────────────────────────────────────────────────────────

function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={logoutStyles.btn}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LogOut size={16} color={colors.danger} strokeWidth={2.2} />
      <Text style={logoutStyles.label}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const logoutStyles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.danger}30`,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StudentProfileScreen() {
  const { logout, user } = useAuth();
  const studentQuery = useCurrentStudent();
  const student = studentQuery.student;
  const cardQuery = useStudentNfcCard(student?.id);
  const permitsQuery = useStudentPermits(student?.id);

  const isLoading =
    studentQuery.isLoading || cardQuery.isLoading || permitsQuery.isLoading;
  const hasError =
    studentQuery.isError || cardQuery.isError || permitsQuery.isError;

  const latestCard = cardQuery.data ?? null;
  const latestPermit = student ? getLatestPermit(permitsQuery.data ?? []) : null;
  const refreshControl = usePullToRefresh(async () => {
    await Promise.all([
      studentQuery.refetch(),
      cardQuery.refetch(),
      permitsQuery.refetch(),
    ]);
  });

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Student"
          subtitle="Your account, permit record, and SRC card details."
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
            {/* Hero card */}
            <ProfileHeroCard
              name={student.name}
              email={user?.email ?? student.email}
              role={user?.role ?? "student"}
            />

            {/* Status chips */}
            <StatusChipPair
              permitStatus={latestPermit?.status ?? null}
              cardStatus={latestCard?.status ?? null}
            />

            {/* Account details */}
            <InfoPanel
              title="Account Overview"
              accentColor={colors.primary}
              rows={[
                {
                  label: "Student ID",
                  value: student.studentId,
                  sub: "Present this when staff verify your permit.",
                },
                {
                  label: "Course",
                  value: student.course,
                  sub: `Level ${student.level}`,
                },
                {
                  label: "Phone",
                  value: student.phone,
                  sub: "Attached to your student record.",
                },
                {
                  label: "Sign-in Email",
                  value: user?.email ?? student.email,
                },
              ]}
            />

            {/* Permit record */}
            <InfoPanel
              title="Permit Record"
              accentColor={
                latestPermit
                  ? PERMIT_COLOR[latestPermit.status]
                  : colors.textMuted
              }
              rows={[
                {
                  label: "Permit Code",
                  value: latestPermit?.permitCode ?? "No Permit",
                  sub: latestPermit
                    ? `${formatDate(latestPermit.startDate)} → ${formatDate(latestPermit.expiryDate)}`
                    : "No permit issued yet.",
                },
                {
                  label: "Amount Paid",
                  value: formatCurrency(latestPermit?.amountPaid),
                  sub: latestPermit
                    ? `Status: ${latestPermit.status.charAt(0).toUpperCase() + latestPermit.status.slice(1)}`
                    : undefined,
                },
              ]}
            />

            {/* Card record */}
            <InfoPanel
              title="SRC Card"
              accentColor={
                latestCard ? CARD_COLOR[latestCard.status] : colors.textMuted
              }
              rows={[
                {
                  label: "Card UID",
                  value: latestCard?.uid ?? "No Card",
                  sub: latestCard
                    ? `Type: ${latestCard.type.replaceAll("_", " ")}`
                    : "No card assigned yet.",
                },
                {
                  label: "Registered",
                  value: formatDate(latestCard?.registeredAt),
                  sub: latestCard
                    ? `Status: ${latestCard.status.charAt(0).toUpperCase() + latestCard.status.slice(1)}`
                    : undefined,
                },
              ]}
            />

            <LogoutButton onPress={logout} />
          </>
        )}
      </AppRefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
    paddingBottom: spacing.xxl + 72,
  },
});
