import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Student } from "@/features/students/student-types";

type StudentCardProps = {
  onPress: () => void;
  student: Student;
};

export function StudentCard({ onPress, student }: StudentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.body}>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {student.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {student.studentId} · Level {student.level}
          </Text>
        </View>

        <View style={styles.rightBlock}>
          <View style={styles.courseBadge}>
            <Text style={styles.courseLabel} numberOfLines={1}>
              {student.course}
            </Text>
          </View>
          <Text style={styles.levelMeta}>Level {student.level}</Text>
        </View>
      </View>
      <ChevronRight
        color={colors.border}
        size={16}
        strokeWidth={2.5}
        style={{ marginRight: 10 }}
      />
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
    elevation: 2,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardPressed: {
    opacity: 0.75,
  },
  body: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  nameBlock: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  name: {
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
    maxWidth: 112,
  },
  courseBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  courseLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  levelMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
});
