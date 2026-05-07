import { Href, useRouter } from "expo-router";
import { ChevronDown, Search, Users } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { StudentCard } from "@/components/cards/student-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { SearchField } from "@/components/ui/search-field";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useStudents } from "@/features/students/use-students";

const PAGE_SIZE = 10;

export default function OperationsStudentsScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const studentsQuery = useStudents();

  // Reset pagination when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm]);

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

        <SearchField
          onChangeText={setSearchTerm}
          placeholder="Search by student ID or name…"
          value={searchTerm}
        />

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
            {filteredStudents.slice(0, visibleCount).map((student) => (
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
            {visibleCount < filteredStudents.length && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
                activeOpacity={0.75}
              >
                <ChevronDown size={16} color={colors.primary} strokeWidth={2.5} />
                <Text style={styles.showMoreText}>
                  Show more · {filteredStudents.length - visibleCount} remaining
                </Text>
              </TouchableOpacity>
            )}
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
  /* ── List ── */
  list: {
    gap: spacing.sm,
  },
  showMoreBtn: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  showMoreText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
});
