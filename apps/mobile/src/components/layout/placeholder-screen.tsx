import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, spacing } from "@/constants/theme";

type PlaceholderScreenProps = {
  title: string;
  screenName: string;
};

export function PlaceholderScreen({
  title,
  screenName,
}: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.screenName}>{screenName}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    textAlign: "center",
  },
  screenName: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    fontWeight: "500",
    textAlign: "center",
  },
});
