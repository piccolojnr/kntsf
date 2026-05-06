import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { CreditCard, ShieldAlert } from "lucide-react-native";
import { useMemo, useState } from "react";

import { CardStatusBadge } from "@/components/cards/card-status-badge";
import { AdminToolScreen } from "@/components/layout/admin-tool-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { TextField } from "@/components/ui/text-field";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { CardStatus } from "@/features/cards/card-types";
import { useCards } from "@/features/cards/use-cards";
import { useStudents } from "@/features/students/use-students";

const statusFilters: Array<CardStatus | "all"> = [
  "all",
  "active",
  "revoked",
  "lost",
  "blocked",
  "replaced",
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status: CardStatus | "all") {
  if (status === "all") return "All";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function OperationsCardsScreen() {
  const cardsQuery = useCards();
  const studentsQuery = useStudents();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CardStatus | "all">("all");

  const studentsById = useMemo(() => {
    const map = new Map<string, NonNullable<typeof studentsQuery.data>[number]>();

    for (const student of studentsQuery.data ?? []) {
      map.set(student.id, student);
    }

    return map;
  }, [studentsQuery.data]);

  const filteredCards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return (cardsQuery.data ?? []).filter((card) => {
      const student = studentsById.get(card.studentId);
      const matchesStatus =
        statusFilter === "all" || card.status === statusFilter;
      const searchable = [
        card.uid,
        card.status,
        student?.name,
        student?.studentId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchable.includes(normalizedSearch);
    });
  }, [cardsQuery.data, search, statusFilter, studentsById]);

  const isLoading = cardsQuery.isLoading || studentsQuery.isLoading;
  const hasError = cardsQuery.isError || studentsQuery.isError;

  return (
    <AdminToolScreen
      title="Cards"
      subtitle="Review card inventory, ownership, and lifecycle status."
    >
      {isLoading ? (
        <LoadingState message="Loading card records..." />
      ) : hasError ? (
        <EmptyState
          description="Card records could not be loaded right now."
          icon={ShieldAlert}
          title="Unable to load cards"
        />
      ) : (
        <>
          <TextField
            label="Search Cards"
            onChangeText={setSearch}
            placeholder="Student ID, name, or UID"
            value={search}
          />

          <View style={styles.filterRow}>
            {statusFilters.map((status) => {
              const active = statusFilter === status;

              return (
                <Pressable
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {formatStatus(status)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.list}>
            {filteredCards.length ? (
              filteredCards.map((card) => {
                const student = studentsById.get(card.studentId);

                return (
                  <View key={card.id} style={styles.cardRow}>
                    <View style={styles.cardIcon}>
                      <CreditCard
                        color={colors.primary}
                        size={18}
                        strokeWidth={2.4}
                      />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardTitleGroup}>
                          <Text style={styles.cardTitle}>
                            {student?.name ?? "Unknown Student"}
                          </Text>
                          <Text style={styles.cardMeta}>
                            {student?.studentId ?? "No student ID"} · {card.uid}
                          </Text>
                        </View>
                        <CardStatusBadge status={card.status} />
                      </View>
                      <Text style={styles.cardMeta}>
                        {card.type.replace("_", " ")} · Registered{" "}
                        {formatDate(card.registeredAt)}
                      </Text>
                      <View style={styles.actions}>
                        <Pressable
                          onPress={() =>
                            Alert.alert(
                              "Card Details",
                              "Detailed card management will be connected later.",
                            )
                          }
                          style={styles.actionButton}
                        >
                          <Text style={styles.actionText}>View Details</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <EmptyState
                description="No card records match your current search or filter."
                icon={CreditCard}
                title="No cards found"
              />
            )}
          </View>
        </>
      )}
    </AdminToolScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  list: {
    gap: spacing.md,
  },
  cardRow: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  cardBody: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  cardTitleGroup: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  actions: {
    alignItems: "flex-start",
  },
  actionButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
