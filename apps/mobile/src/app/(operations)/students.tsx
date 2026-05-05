import { Search, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { StudentCard } from "@/components/cards/student-card";
import { StudentDetailModal } from "@/components/cards/student-detail-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useStudents } from "@/features/students/use-students";

export default function OperationsStudentsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const studentsQuery = useStudents();

  const filteredStudents = useMemo(() => {
    const students = studentsQuery.data ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.studentId.toLowerCase().includes(normalizedSearch) ||
        student.name.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchTerm, studentsQuery.data]);

  return (
    <Screen scrolled>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.eyebrow}>OPERATIONS</Text>
            {studentsQuery.data && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{studentsQuery.data.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>Students Directory</Text>
          <Text style={styles.subtitle}>
            Search student records and manage NFC card assignments.
          </Text>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchPill}>
          <Search color={colors.textMuted} size={16} strokeWidth={2.5} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchTerm}
            placeholder="Search by student ID or name…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
            value={searchTerm}
          />
        </View>

        {/* ── List ── */}
        {studentsQuery.isLoading ? (
          <LoadingState message="Loading student records..." />
        ) : studentsQuery.isError ? (
          <EmptyState
            description="Student records could not be loaded right now."
            icon={Users}
            title="Unable to load students"
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            description="No student matched your current search."
            icon={Search}
            title="No students found"
          />
        ) : (
          <View style={styles.list}>
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                onPress={() => setSelectedStudentId(student.studentId)}
                student={student}
              />
            ))}
          </View>
        )}
        <View style={{ height: spacing.xxxxxl * 2 }} />
      </ScrollView>

      <StudentDetailModal
        onClose={() => setSelectedStudentId(null)}
        student={
          studentsQuery.data?.find((s) => s.studentId === selectedStudentId) ??
          null
        }
        visible={selectedStudentId !== null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.xxxxl,
  },

  /* ── Header ── */
  header: {
    gap: spacing.xs,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: 2,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  countBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  countText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },

  /* ── Search ── */
  searchPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: "500",
  },

  /* ── List ── */
  list: {
    gap: spacing.md,
  },
});
