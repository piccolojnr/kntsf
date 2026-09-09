import { Nfc } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

import { colors, radius, spacing } from "@/constants/theme";
import { CardStatus } from "@/features/cards/card-types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentData {
  name?: string;
  studentId?: string;
  programme?: string;
  level?: string;
  /** Kept for backwards compatibility — not currently displayed on the card */
  validUntil?: string;
  status?: CardStatus;
  photoUri?: string;
}

interface StudentIDCardProps {
  student?: StudentData;
  style?: ViewStyle;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const FALLBACK: Required<StudentData> = {
  name: "Student Name",
  studentId: "00000000",
  programme: "Programme",
  level: "—",
  validUntil: "—",
  status: "active",
  photoUri: "",
};

const STATUS: Record<CardStatus, { label: string; color: string }> = {
  active: { label: "ACTIVE", color: colors.success },
  inactive: { label: "INACTIVE", color: colors.textMuted },
  blocked: { label: "BLOCKED", color: colors.danger },
  revoked: { label: "REVOKED", color: colors.danger },
  lost: { label: "LOST", color: colors.warning },
  stolen: { label: "STOLEN", color: colors.danger },
  replaced: { label: "REPLACED", color: colors.warning },
  damaged: { label: "DAMAGED", color: colors.warning },
};

// Status → card bg colours (dark, distinct per state)
const CARD_BG: Record<CardStatus, { bg: string; border: string; glow: string }> = {
  active: {
    bg: colors.navy,
    border: `${colors.gold}66`,
    glow: "rgba(16, 42, 76, 0.24)",
  },
  inactive: { bg: "#10151f", border: "#33415533", glow: "#33415566" },
  blocked: { bg: "#1a0a0a", border: "#5f1e1e33", glow: "#99241f66" },
  revoked: { bg: "#1a0a0a", border: "#5f1e1e33", glow: "#99241f66" },
  lost: { bg: "#1a1200", border: "#5f4a1e33", glow: "#99781f66" },
  stolen: { bg: "#1a0a0a", border: "#5f1e1e33", glow: "#99241f66" },
  replaced: { bg: "#0f0f1a", border: "#2e2e5f33", glow: "#4a4a9966" },
  damaged: { bg: "#1a1200", border: "#5f4a1e33", glow: "#99781f66" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={chipStyles.wrap}>
      <Text style={chipStyles.label}>{label}</Text>
      <Text style={chipStyles.value}>{value}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrap: { gap: 3 },
  label: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  value: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentIDCard({ student, style }: StudentIDCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const d: Required<StudentData> = { ...FALLBACK, ...student };
  const [err, setErr] = useState(false);
  const showPhoto = !!d.photoUri && !err;
  const st = STATUS[d.status] ?? STATUS.active;
  const bg = CARD_BG[d.status] ?? CARD_BG.active;

  const cardWidth = Math.min(screenWidth - 32, 440);

  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: bg.bg,
          borderColor: bg.border,
          boxShadow: `0 12px 30px ${bg.glow}`,
        },
        style,
      ]}
    >
      {/* ── Top: issuer + NFC icon ───────────────────────── */}
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <Text style={styles.issuerLabel}>KNUTSFORD UNIVERSITY</Text>
          <Text style={styles.issuerSub}>SRC STUDENT CARD</Text>
        </View>

        <View
          style={[
            styles.nfcWrap,
            { backgroundColor: `${st.color}15`, borderColor: `${st.color}30` },
          ]}
        >
          <Nfc size={22} color={st.color} strokeWidth={1.5} />
          <Text style={[styles.nfcLabel, { color: st.color }]}>NFC</Text>
        </View>
      </View>

      {/* ── Middle: name + photo ─────────────────────────── */}
      <View style={styles.mid}>
        <View style={styles.nameBlock}>
          <Text style={styles.nameEyebrow}>STUDENT</Text>
          <Text style={styles.name} numberOfLines={1}>
            {d.name}
          </Text>
          <Text style={styles.programme} numberOfLines={1}>
            {d.programme}
          </Text>
        </View>

        {/* Photo / initials */}
        <View style={styles.photoWrap}>
          {showPhoto ? (
            <Image
              source={{ uri: d.photoUri }}
              style={styles.photo}
              onError={() => setErr(true)}
            />
          ) : (
            <Text style={styles.initialsText}>{initials(d.name)}</Text>
          )}
        </View>
      </View>

      {/* ── Dashed divider ───────────────────────────────── */}
      <View style={styles.dividerRow}>
        <View
          style={[
            styles.notch,
            styles.notchLeft,
            { backgroundColor: colors.background },
          ]}
        />
        <View style={styles.dashedLine}>
          {Array.from({ length: 18 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dash,
                { backgroundColor: `${st.color}28` },
              ]}
            />
          ))}
        </View>
        <View
          style={[
            styles.notch,
            styles.notchRight,
            { backgroundColor: colors.background },
          ]}
        />
      </View>

      {/* ── Bottom: meta chips + status ──────────────────── */}
      <View style={styles.bottom}>
        <MetaChip label="Student ID" value={d.studentId} />
        <View
          style={[
            styles.dividerV,
            { backgroundColor: `${st.color}20` },
          ]}
        />
        <MetaChip label="Level" value={d.level} />
        <View
          style={[
            styles.dividerV,
            { backgroundColor: `${st.color}20` },
          ]}
        />
        {/* Status pill */}
        <View style={styles.statusWrap}>
          <Text style={[styles.statusLabel, { color: st.color }]}>
            {st.label}
          </Text>
        </View>
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
    color: "#efd494",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  issuerSub: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 2,
  },
  nfcWrap: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nfcLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Middle
  mid: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameBlock: {
    flex: 1,
    gap: 4,
    paddingRight: spacing.md,
  },
  nameEyebrow: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 2,
  },
  name: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  programme: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 12,
    fontWeight: "500",
  },
  photoWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 72,
    justifyContent: "center",
    overflow: "hidden",
    width: 60,
  },
  photo: { height: "100%", resizeMode: "cover", width: "100%" },
  initialsText: {
    color: "rgba(255,255,255,0.20)",
    fontSize: 22,
    fontWeight: "700",
  },

  // Divider
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: -spacing.lg,
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

  // Bottom
  bottom: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  dividerV: {
    height: 32,
    width: 1,
  },
  statusWrap: {
    alignItems: "flex-end",
    flex: 1,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
