import { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";

import { colors, spacing } from "@/constants/theme";

type ScreenProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
});
