import { Href, useRouter } from "expo-router";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@/constants/theme";

type NavigationListItemProps = {
  description?: string;
  href: Href;
  icon: LucideIcon;
  label: string;
};

export function NavigationListItem({
  description,
  href,
  icon: Icon,
  label,
}: NavigationListItemProps) {
  const router = useRouter();

  return (
    <Pressable style={styles.item} onPress={() => router.push(href)}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Icon color={colors.primary} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </View>
      <ChevronRight
        color={colors.textMuted}
        size={18}
        strokeWidth={2.2}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  chevron: {
    marginTop: spacing.xs,
  },
});
