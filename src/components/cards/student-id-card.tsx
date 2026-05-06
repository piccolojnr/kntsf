import { theme } from "@/constants/theme";
import { CardStatus } from "@/features/cards/card-types";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

export interface StudentData {
  name?: string;
  studentId?: string;
  programme?: string;
  level?: string;
  validUntil?: string;
  status?: CardStatus;
  photoUri?: string;
}

interface StudentIDCardProps {
  student?: StudentData;
  style?: ViewStyle;
}

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
  active: { label: "ACTIVE", color: "#2ECC71" },
  blocked: { label: "BLOCKED", color: "#E74C3C" },
  revoked: { label: "REVOKED", color: "#E74C3C" },
  lost: { label: "LOST", color: "#E74C3C" },
  replaced: { label: "REPLACED", color: "#E74C3C" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function StudentIDCard({ student, style }: StudentIDCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const d: Required<StudentData> = { ...FALLBACK, ...student };
  const [err, setErr] = useState(false);
  const showPhoto = !!d.photoUri && !err;
  const st = STATUS[d.status] ?? STATUS.active;

  // Card fills screen width minus 32px margin, capped at 500px
  const cardWidth = Math.min(screenWidth - 32, 500);
  // Height scales proportionally (500:290 ratio)
  const cardHeight = Math.round(cardWidth * (290 / 500));

  // Scale font sizes and spacing relative to card width
  const s = cardWidth / 500;
  const scale = (n: number) => Math.round(n * s);

  const photoSize = {
    width: scale(76),
    height: scale(90),
    borderRadius: scale(12),
  };

  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
          borderRadius: scale(20),
          paddingHorizontal: scale(28),
          paddingTop: scale(26),
          paddingBottom: scale(22),
        },
        style,
      ]}
    >
      {/* Top row */}
      <View style={styles.top}>
        <View style={styles.logoRow}>
          <View
            style={[
              styles.dot,
              {
                width: scale(8),
                height: scale(8),
                borderRadius: scale(4),
                marginTop: scale(3),
              },
            ]}
          />
          <View>
            <Text
              style={[
                styles.uniName,
                { fontSize: scale(11), letterSpacing: scale(1) },
              ]}
            >
              KNUTSFORD UNIVERSITY
            </Text>
            <Text
              style={[
                styles.motto,
                { fontSize: scale(8), marginTop: scale(2) },
              ]}
            >
              LEARN · LEAD · SERVE
            </Text>
          </View>
        </View>
        <View style={styles.nfcBlock}>
          <Text style={[styles.nfcWaves, { fontSize: scale(13) }]}>)))</Text>
          <Text
            style={[
              styles.nfcLabel,
              { fontSize: scale(8), marginTop: scale(1) },
            ]}
          >
            NFC
          </Text>
        </View>
      </View>

      {/* Middle: name + photo */}
      <View style={styles.mid}>
        <View style={styles.nameBlock}>
          <Text
            style={[
              styles.idTag,
              { fontSize: scale(8), marginBottom: scale(6) },
            ]}
          >
            SRC STUDENT ID
          </Text>
          <Text
            style={[
              styles.name,
              { fontSize: scale(26), lineHeight: scale(30) },
            ]}
            numberOfLines={1}
          >
            {d.name}
          </Text>
          <Text
            style={[
              styles.programme,
              { fontSize: scale(11), marginTop: scale(5) },
            ]}
            numberOfLines={1}
          >
            {d.programme}
          </Text>
        </View>
        <View style={[styles.photoWrap, photoSize]}>
          {showPhoto ? (
            <Image
              source={{ uri: d.photoUri }}
              style={styles.photo}
              onError={() => setErr(true)}
            />
          ) : (
            <Text style={[styles.initialsText, { fontSize: scale(22) }]}>
              {initials(d.name)}
            </Text>
          )}
        </View>
      </View>

      {/* Hairline */}
      <View style={styles.hairline} />

      {/* Bottom: meta + status */}
      <View style={styles.bottom}>
        <View style={[styles.metaRow, { gap: scale(20) }]}>
          {[
            { key: "STUDENT ID", val: d.studentId },
            { key: "VALID UNTIL", val: d.validUntil },
            { key: "LEVEL", val: d.level },
          ].map(({ key, val }) => (
            <View key={key} style={styles.field}>
              <Text style={[styles.fieldKey, { fontSize: scale(7.5) }]}>
                {key}
              </Text>
              <Text style={[styles.fieldVal, { fontSize: scale(11) }]}>
                {val}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: st.color,
                width: scale(5),
                height: scale(5),
                borderRadius: scale(3),
              },
            ]}
          />
          <Text
            style={[
              styles.statusLabel,
              { color: st.color, fontSize: scale(9) },
            ]}
          >
            {st.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    justifyContent: "space-between",
    overflow: "hidden",
    alignSelf: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: theme.spacing.sm },
    shadowOpacity: 0.4,
    shadowRadius: theme.spacing.lg,
    // Android
    elevation: 12,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    flexShrink: 1,
  },
  dot: {
    backgroundColor: "#FFFFFF",
    flexShrink: 0,
  },
  uniName: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  motto: {
    color: "rgba(255,255,255,0.28)",
    letterSpacing: 0.8,
  },
  nfcBlock: { alignItems: "flex-end", flexShrink: 0 },
  nfcWaves: { color: "rgba(255,255,255,0.2)" },
  nfcLabel: { color: "rgba(255,255,255,0.2)", letterSpacing: 0.5 },
  mid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  nameBlock: { flex: 1, paddingRight: 12 },
  idTag: {
    color: "rgba(255,255,255,0.25)",
    fontWeight: "500",
    letterSpacing: 2,
  },
  name: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  programme: {
    color: "rgba(255,255,255,0.35)",
    fontWeight: "400",
  },
  photoWrap: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  initialsText: {
    color: "rgba(255,255,255,0.2)",
    fontWeight: "600",
  },
  hairline: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  metaRow: {
    flexDirection: "row",
    flexShrink: 1,
  },
  field: { gap: 3 },
  fieldKey: {
    color: "rgba(255,255,255,0.22)",
    fontWeight: "500",
    letterSpacing: 1.4,
  },
  fieldVal: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  statusDot: {},
  statusLabel: {
    fontWeight: "600",
    letterSpacing: 1.5,
  },
});
