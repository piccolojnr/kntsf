import { Mail, Phone } from "lucide-react-native";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Student } from "@/features/students/student-types";

type StudentInfoCardProps = {
  student: Student;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function DetailChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <View style={styles.card}>
      {/* ── Avatar + name ── */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name} numberOfLines={2}>
            {student.name}
          </Text>
          <Text style={styles.programme} numberOfLines={1}>
            {student.course}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {student.level}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Detail chips ── */}
      <View style={styles.chips}>
        <DetailChip label="Student ID" value={student.studentId} />
        <DetailChip label="Level" value={student.level} />
      </View>

      {/* ── Contact ── */}
      <View style={styles.contactRow}>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL(`tel:${student.phone}`)}
          activeOpacity={0.7}
        >
          <Phone color={colors.primary} size={14} strokeWidth={2.5} />
          <Text style={styles.contactText} numberOfLines={1}>
            {student.phone}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL(`mailto:${student.email}`)}
          activeOpacity={0.7}
        >
          <Mail color={colors.primary} size={14} strokeWidth={2.5} />
          <Text style={styles.contactText} numberOfLines={1}>
            {student.email}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },

  /* ── Hero ── */
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  programme: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "500",
    lineHeight: 20,
  },
  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  levelBadgeText: {
    color: colors.primary,
    fontSize: fontSizes.xxs,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.lg,
  },

  /* ── Detail chips ── */
  chips: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flex: 1,
    gap: 3,
    padding: spacing.md,
  },
  chipLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  chipValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },

  /* ── Contact ── */
  contactRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  contactBtn: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  contactText: {
    color: colors.primary,
    flex: 1,
    fontSize: fontSizes.xs,
    fontWeight: "700",
  },
});
