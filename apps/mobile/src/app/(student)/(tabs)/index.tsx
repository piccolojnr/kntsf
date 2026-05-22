import { Href, router } from "expo-router";
import {
  ArrowRight,
  CalendarClock,
  CreditCard,
  FileText,
  ShieldAlert,
  ShieldCheck,
  User,
  UserRound,
  Vote,
} from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import StudentIDCard from "@/components/cards/student-id-card";
import { StudentPermitHistoryItem } from "@/components/cards/student-permit-history-item";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { CardStatus } from "@/features/cards/card-types";
import { useStudentNfcCard } from "@/features/cards/use-student-card";
import { Permit } from "@/features/permits/permit-types";
import { useStudentPermits } from "@/features/permits/use-student-permits";
import { useCurrentStudent } from "@/features/students/use-current-student";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuickAction = {
  label: string;
  sublabel: string;
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth?: number;
  }>;
  href: Href;
  accent: string;
  accentSoft: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Request",
    sublabel: "Pay permit",
    icon: CalendarClock,
    href: "/(student)/permit-request" as Href,
    accent: colors.success,
    accentSoft: colors.successSoft,
  },
  {
    label: "Permits",
    sublabel: "View history",
    icon: FileText,
    href: "/(student)/(tabs)/permits" as Href,
    accent: colors.primary,
    accentSoft: colors.primarySoft,
  },
  {
    label: "My Card",
    sublabel: "NFC status",
    icon: CreditCard,
    href: "/(student)/(tabs)/card" as Href,
    accent: "#7c3aed",
    accentSoft: "#ede9fe",
  },
  {
    label: "Elections",
    sublabel: "Vote",
    icon: Vote,
    href: "/(student)/elections" as Href,
    accent: colors.warning,
    accentSoft: colors.warningSoft,
  },
  {
    label: "Profile",
    sublabel: "Settings",
    icon: User,
    href: "/(student)/(tabs)/profile" as Href,
    accent: "#0891b2",
    accentSoft: "#e0f2fe",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString?: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    currency: "GHS",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function GreetingHeader({
  name,
  initials,
}: {
  name: string;
  initials: string;
}) {
  return (
    <View style={styles.greetingHeader}>
      <View style={styles.greetingLeft}>
        <Text style={styles.greetingDate}>{getTodayLabel()}</Text>
        <Text style={styles.greetingText}>
          {getGreeting()},{"\n"}
          <Text style={styles.greetingName}>{name.split(" ")[0]}</Text>
        </Text>
      </View>
      <View style={styles.avatarRing}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
    </View>
  );
}

function QuickActionsGrid() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [
              styles.actionTile,
              pressed && styles.actionTilePressed,
            ]}
            onPress={() => router.push(action.href)}
          >
            <View
              style={[
                styles.actionIconWrap,
                { backgroundColor: action.accentSoft },
              ]}
            >
              <action.icon size={20} color={action.accent} strokeWidth={2.2} />
            </View>
            <Text style={styles.actionTileLabel}>{action.label}</Text>
            <Text style={[styles.actionTileSub, { color: action.accent }]}>
              {action.sublabel}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function PermitStatusPanel({ permit }: { permit: Permit | null }) {
  if (!permit) {
    return (
      <View style={[styles.permitPanel, styles.permitPanelEmpty]}>
        <View style={styles.permitPanelIcon}>
          <FileText size={22} color={colors.textMuted} strokeWidth={2} />
        </View>
        <View style={styles.permitPanelCopy}>
          <Text style={styles.permitPanelTitle}>No Active Permit</Text>
          <Text style={styles.permitPanelSub}>
            No permit has been issued for your account yet.
          </Text>
        </View>
      </View>
    );
  }

  const isActive = permit.status === "active";
  const isExpired = permit.status === "expired";

  const palette = isActive
    ? {
        bg: "#f0fdf4",
        border: "#bbf7d0",
        accent: colors.success,
        icon: "#16a34a",
      }
    : isExpired
      ? {
          bg: "#fffbeb",
          border: "#fde68a",
          accent: colors.warning,
          icon: "#b45309",
        }
      : {
          bg: "#fff1f2",
          border: "#fecdd3",
          accent: colors.danger,
          icon: "#be123c",
        };

  const statusLabel =
    permit.status.charAt(0).toUpperCase() + permit.status.slice(1);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.permitPanel,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={() => router.push("/(student)/(tabs)/permits" as Href)}
    >
      {/* Top row */}
      <View style={styles.permitPanelTop}>
        <View style={styles.permitPanelIconActive}>
          <ShieldCheck size={20} color={palette.icon} strokeWidth={2.2} />
        </View>
        <View style={styles.permitStatusBadge}>
          <View
            style={[styles.statusDot, { backgroundColor: palette.accent }]}
          />
          <Text style={[styles.statusBadgeText, { color: palette.accent }]}>
            {statusLabel}
          </Text>
        </View>
        <ArrowRight size={16} color={palette.accent} strokeWidth={2.5} />
      </View>

      {/* Code + details */}
      <View style={styles.permitPanelBody}>
        <Text style={styles.permitEyebrow}>SRC Permit</Text>
        <Text style={[styles.permitCode, { color: palette.icon }]}>
          {permit.permitCode}
        </Text>
      </View>

      {/* Dates row */}
      <View style={styles.permitMeta}>
        <View style={styles.permitMetaItem}>
          <CalendarClock size={13} color={palette.accent} strokeWidth={2.2} />
          <Text style={[styles.permitMetaLabel, { color: palette.accent }]}>
            {formatDate(permit.startDate)} → {formatDate(permit.expiryDate)}
          </Text>
        </View>
        <Text style={[styles.permitAmount, { color: palette.icon }]}>
          {formatCurrency(permit.amountPaid)}
        </Text>
      </View>
    </Pressable>
  );
}

function PermitHistorySection({ permits }: { permits: Permit[] }) {
  const recent = permits.slice(0, 3);
  if (!recent.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Permit History</Text>
        <Pressable
          style={({ pressed }) => [
            styles.seeAllBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => router.push("/(student)/(tabs)/permits" as Href)}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <ArrowRight size={13} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>
      <View style={styles.historyList}>
        {recent.map((permit) => (
          <StudentPermitHistoryItem key={permit.id} permit={permit} />
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StudentHomeScreen() {
  const studentQuery = useCurrentStudent();
  const student = studentQuery.student;
  const permitsQuery = useStudentPermits(student?.id);
  const cardQuery = useStudentNfcCard(student?.id);

  const isLoading =
    studentQuery.isLoading || permitsQuery.isLoading || cardQuery.isLoading;
  const hasError =
    studentQuery.isError || permitsQuery.isError || cardQuery.isError;

  const allPermits = permitsQuery.data ?? [];
  const latestPermit = student ? getLatestPermit(allPermits) : null;
  const latestCard = cardQuery.data ?? null;
  const displayCardStatus: CardStatus = latestCard?.status ?? "inactive";
  const refreshControl = usePullToRefresh(async () => {
    await Promise.all([
      studentQuery.refetch(),
      permitsQuery.refetch(),
      cardQuery.refetch(),
    ]);
  });

  const sortedPermits = [...allPermits].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingState message="Loading your workspace..." />
        ) : hasError ? (
          <EmptyState
            description="Your student workspace could not be loaded right now."
            icon={ShieldAlert}
            title="Unable to load"
          />
        ) : !student ? (
          <EmptyState
            description="No linked student record was found for this account."
            icon={UserRound}
            title="Student record not found"
          />
        ) : (
          <>
            {/* Greeting */}
            <GreetingHeader
              name={student.name}
              initials={getInitials(student.name)}
            />

            {/* ID Card — unchanged */}
            <StudentIDCard
              student={{
                name: student.name,
                studentId: student.studentId,
                programme: student.course,
                level: student.level,
                validUntil: latestCard
                  ? formatDate(latestCard.registeredAt)
                  : undefined,
                status: displayCardStatus,
              }}
            />

            {/* Active permit panel */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Current Permit</Text>
              <PermitStatusPanel permit={latestPermit} />
            </View>

            {/* Quick actions */}
            <QuickActionsGrid />

            {/* Permit history */}
            <PermitHistorySection permits={sortedPermits} />
          </>
        )}
      </AppRefreshableScrollView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl + 72,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
  },

  // ── Greeting ────────────────────────────────────────────────────────────────
  greetingHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  greetingLeft: {
    flex: 1,
    gap: 4,
  },
  greetingDate: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  greetingText: {
    color: colors.textMuted,
    fontSize: fontSizes.xl,
    fontWeight: "400",
    lineHeight: 34,
  },
  greetingName: {
    color: colors.text,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  avatarRing: {
    alignItems: "center",
    borderColor: colors.primarySoft,
    borderRadius: 30,
    borderWidth: 2,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: "900",
  },

  // ── Sections ────────────────────────────────────────────────────────────────
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "900",
    letterSpacing: -0.1,
  },
  seeAllBtn: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },

  // ── Quick actions ────────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionTile: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    minWidth: "30%",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  actionTilePressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  actionIconWrap: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    marginBottom: 4,
    width: 40,
  },
  actionTileLabel: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "900",
    letterSpacing: -0.1,
  },
  actionTileSub: {
    fontSize: fontSizes.xxs,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // ── Permit panel ────────────────────────────────────────────────────────────
  permitPanel: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
    padding: spacing.md,
  },
  permitPanelEmpty: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    flexDirection: "row",
    gap: spacing.md,
  },
  permitPanelIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  permitPanelCopy: {
    flex: 1,
    gap: 3,
  },
  permitPanelTitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "900",
  },
  permitPanelSub: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    lineHeight: 17,
  },
  // Active permit panel
  permitPanelTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  permitPanelIconActive: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: radius.sm,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  permitStatusBadge: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 5,
  },
  statusDot: {
    borderRadius: radius.lg,
    height: 7,
    width: 7,
  },
  statusBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  permitPanelBody: {
    gap: 2,
  },
  permitEyebrow: {
    color: "rgba(0,0,0,0.35)",
    fontSize: fontSizes.xxs,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  permitCode: {
    fontSize: fontSizes.lg,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  permitMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  permitMetaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  permitMetaLabel: {
    fontSize: fontSizes.xxs,
    fontWeight: "700",
  },
  permitAmount: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
  },

  // ── History ──────────────────────────────────────────────────────────────────
  historyList: {
    gap: spacing.sm,
  },
});
