import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Student } from "@/features/students/student-types";

type StudentCardProps = {
  onPress: () => void;
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

export function StudentCard({ onPress, student }: StudentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {student.name}
        </Text>
        <Text style={styles.studentId}>{student.studentId}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {student.course} · Level {student.level}
        </Text>
      </View>
      <ChevronRight color={colors.border} size={20} strokeWidth={2.5} />
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
    gap: spacing.md,
    padding: spacing.md,
  },
  cardPressed: {
    backgroundColor: colors.background,
    borderColor: colors.primarySoft,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: "800",
    letterSpacing: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  studentId: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
});
