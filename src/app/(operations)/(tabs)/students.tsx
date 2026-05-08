import { Href, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { StudentCard } from "@/components/cards/student-card";
import { AppRefreshControl } from "@/components/ui/app-refresh-control";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { SearchField } from "@/components/ui/search-field";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { useStudentsPage } from "@/features/students/use-students";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

const PAGE_SIZE = 10;

export default function OperationsStudentsScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsQuery = useStudentsPage({
    search: searchTerm,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredStudents = useMemo(() => {
    const students = studentsQuery.data?.items ?? [];
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
  }, [searchTerm, studentsQuery.data?.items]);

  const pagination = studentsQuery.data?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const refreshControl = usePullToRefresh(async () => {
    await studentsQuery.refetch();
  });

  return (
    <Screen scrolled>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<AppRefreshControl {...refreshControl} />}
      >
        <PageHeader
          badgeText={
            pagination ? String(pagination.total) : undefined
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
            <View style={styles.paginationRow}>
              <Pressable
                disabled={!canGoPrev}
                onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
                style={[
                  styles.paginationBtn,
                  !canGoPrev && styles.paginationBtnDisabled,
                ]}
              >
                <ChevronLeft size={16} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.paginationBtnText}>Prev</Text>
              </Pressable>
              <Text style={styles.paginationLabel}>
                Page {pagination?.page ?? currentPage} of {totalPages}
              </Text>
              <Pressable
                disabled={!canGoNext}
                onPress={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                style={[
                  styles.paginationBtn,
                  !canGoNext && styles.paginationBtnDisabled,
                ]}
              >
                <Text style={styles.paginationBtnText}>Next</Text>
                <ChevronRight size={16} color={colors.primary} strokeWidth={2.2} />
              </Pressable>
            </View>
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
  paginationRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  paginationBtn: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: `${colors.primary}30`,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  paginationBtnDisabled: {
    opacity: 0.5,
  },
  paginationBtnText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  paginationLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
});
