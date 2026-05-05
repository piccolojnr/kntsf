import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";

type PermitLedgerRowProps = {
  onPress: () => void;
  permit: Permit;
  student: Student | null;
};

const statusConfig = {
  active: {
    accent: colors.success,
    soft: colors.successSoft,
    label: "Active",
  },
  expired: {
    accent: colors.warning,
    soft: colors.warningSoft,
    label: "Expired",
  },
  revoked: {
    accent: colors.danger,
    soft: colors.dangerSoft,
    label: "Revoked",
  },
} as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PermitLedgerRow({
  onPress,
  permit,
  student,
}: PermitLedgerRowProps) {
  const config = statusConfig[permit.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Left accent bar */}

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.nameBlock}>
            <Text style={styles.studentName} numberOfLines={1}>
              {student?.name ?? "Unknown Student"}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {permit.permitCode} · {student?.studentId ?? "No ID"}
            </Text>
          </View>

          <View style={styles.rightBlock}>
            <View
              style={[styles.statusBadge, { backgroundColor: config.soft }]}
            >
              <Text style={[styles.statusLabel, { color: config.accent }]}>
                {config.label}
              </Text>
            </View>
            <Text style={styles.expiryDate}>
              {formatDate(permit.expiryDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight color={colors.border} size={16} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.75,
  },

  accentBar: {
    alignSelf: "stretch",
    width: 4,
  },

  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  top: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  nameBlock: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  studentName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },

  rightBlock: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  expiryDate: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
});
