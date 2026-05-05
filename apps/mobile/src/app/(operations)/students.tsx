import { Href, useRouter } from "expo-router";
import { Search, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

import { StudentCard } from "@/components/cards/student-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useStudents } from "@/features/students/use-students";

export default function OperationsStudentsScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
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
        <PageHeader
          badgeText={
            studentsQuery.data ? String(studentsQuery.data.length) : undefined
          }
          eyebrow="Operations"
          subtitle="Search student records and manage NFC card assignments."
          title="Students"
        />

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
                onPress={() =>
                  router.push(
                    `/(operations)/student-details?studentId=${student.studentId}` as Href,
                  )
                }
                student={student}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
    paddingBottom: spacing.xxl + 96,
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
