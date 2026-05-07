import { ShieldCheck, ShieldOff, ShieldAlert } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

import { colors, radius, spacing } from "@/constants/theme";
import { Permit, PermitStatus } from "@/features/permits/permit-types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentPermitCardProps {
  studentName: string;
  permit: Permit;
  style?: ViewStyle;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PermitStatus,
  {
    label: string;
    fg: string;
    bg: string;
    gradientTop: string;
    gradientBot: string;
    Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  }
> = {
  active: {
    label: "ACTIVE",
    fg: "#22c55e",
    bg: "#052e16",
    gradientTop: "#0f2b1a",
    gradientBot: "#071f12",
    Icon: ShieldCheck,
  },
  expired: {
    label: "EXPIRED",
    fg: "#f59e0b",
    bg: "#1c1502",
    gradientTop: "#1f1a04",
    gradientBot: "#14100200",
    Icon: ShieldAlert,
  },
  revoked: {
    label: "REVOKED",
    fg: "#ef4444",
    bg: "#1e0505",
    gradientTop: "#220808",
    gradientBot: "#160404",
    Icon: ShieldOff,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    currency: "GHS",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(n);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetaChip({ label, value, light }: { label: string; value: string; light?: boolean }) {
  return (
    <View style={chipStyles.wrap}>
      <Text style={chipStyles.label}>{label}</Text>
      <Text style={[chipStyles.value, light && chipStyles.valueLight]}>{value}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrap: { gap: 3 },
  label: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  value: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  valueLight: {
    color: "#ffffff",
    fontSize: 13,
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentPermitCard({
  studentName,
  permit,
  style,
}: StudentPermitCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - 32, 440);
  const st = STATUS_CONFIG[permit.status] ?? STATUS_CONFIG.active;
  const { Icon } = st;

  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: st.bg,
          borderColor: `${st.fg}22`,
          shadowColor: st.fg,
        },
        style,
      ]}
    >
      {/* ── Top section ──────────────────────────────── */}
      <View style={styles.top}>
        {/* Left: issuer + holder */}
        <View style={styles.topLeft}>
          <Text style={styles.issuerLabel}>KNUTSFORD SRC</Text>
          <Text style={styles.holderName} numberOfLines={1}>
            {studentName}
          </Text>
        </View>

        {/* Right: status shield */}
        <View
          style={[
            styles.shieldWrap,
            { backgroundColor: `${st.fg}15`, borderColor: `${st.fg}30` },
          ]}
        >
          <Icon size={28} color={st.fg} strokeWidth={1.5} />
          <Text style={[styles.shieldLabel, { color: st.fg }]}>{st.label}</Text>
        </View>
      </View>

      {/* ── Permit code — hero text ───────────────────── */}
      <View style={styles.codeSection}>
        <Text style={styles.codeEyebrow}>PERMIT CODE</Text>
        <Text style={styles.codeText}>{permit.permitCode}</Text>
      </View>

      {/* ── Dashed divider ───────────────────────────── */}
      <View style={styles.dividerRow}>
        <View style={[styles.notch, styles.notchLeft, { backgroundColor: colors.background }]} />
        <View style={styles.dashedLine}>
          {Array.from({ length: 18 }).map((_, i) => (
            <View
              key={i}
              style={[styles.dash, { backgroundColor: `${st.fg}28` }]}
            />
          ))}
        </View>
        <View style={[styles.notch, styles.notchRight, { backgroundColor: colors.background }]} />
      </View>

      {/* ── Bottom: details grid ─────────────────────── */}
      <View style={styles.bottom}>
        <MetaChip label="Valid From" value={formatDate(permit.startDate)} />
        <View style={[styles.dividerV, { backgroundColor: `${st.fg}20` }]} />
        <MetaChip label="Expires" value={formatDate(permit.expiryDate)} />
        <View style={[styles.dividerV, { backgroundColor: `${st.fg}20` }]} />
        <MetaChip label="Amount Paid" value={formatCurrency(permit.amountPaid)} light />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const NOTCH_SIZE = 18;

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.lg,
    overflow: "hidden",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    // shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },

  // Top
  top: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topLeft: {
    flex: 1,
    gap: 4,
    paddingRight: spacing.md,
  },
  issuerLabel: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  holderName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  shieldWrap: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  shieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  // Code section
  codeSection: {
    gap: 6,
  },
  codeEyebrow: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 2,
  },
  codeText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Dashed divider
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: -spacing.lg, // bleed to card edges
  },
  notch: {
    borderRadius: NOTCH_SIZE / 2,
    height: NOTCH_SIZE,
    width: NOTCH_SIZE / 2,
  },
  notchLeft: {
    borderBottomRightRadius: NOTCH_SIZE,
    borderTopRightRadius: NOTCH_SIZE,
  },
  notchRight: {
    borderBottomLeftRadius: NOTCH_SIZE,
    borderTopLeftRadius: NOTCH_SIZE,
  },
  dashedLine: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  dash: {
    borderRadius: 2,
    height: 2,
    width: 8,
  },

  // Bottom grid
  bottom: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  dividerV: {
    height: 36,
    width: 1,
  },
});
