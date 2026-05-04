import { Href, useRouter } from "expo-router";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@/constants/theme";

type NavigationListItemProps = {
  href: Href;
  icon: LucideIcon;
  label: string;
};

export function NavigationListItem({
  href,
  icon: Icon,
  label,
}: NavigationListItemProps) {
  const router = useRouter();

  return (
    <Pressable style={styles.item} onPress={() => router.push(href)}>
      <View style={styles.left}>
        <Icon color={colors.primary} size={18} strokeWidth={2.2} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
});
