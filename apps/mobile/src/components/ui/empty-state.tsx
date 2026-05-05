import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

type EmptyStateProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Icon color={colors.danger} size={18} strokeWidth={2.5} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  accent: {
    backgroundColor: colors.danger,
    width: 4,
  },
  body: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  copy: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  title: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  description: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
