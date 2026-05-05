import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Student } from "@/features/students/student-types";

type StudentInfoCardProps = {
  student: Student;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Student Profile</Text>
      <View style={styles.divider} />
      <View style={styles.body}>
        <InfoRow label="Name" value={student.name} />
        <InfoRow label="Student ID" value={student.studentId} />
        <InfoRow label="Course" value={student.course} />
        <InfoRow label="Level" value={student.level} />
        <InfoRow label="Phone" value={student.phone} />
        <InfoRow label="Email" value={student.email} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -spacing.lg,
  },
  body: {
    gap: spacing.xs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  value: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    paddingLeft: spacing.md,
    textAlign: "right",
  },
});
