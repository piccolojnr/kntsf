import { colors, spacing } from "@/constants/theme";
import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  style?: ViewStyle;
  scrolled?: boolean;
  freeBottom?: boolean;
}>;

export function Screen({ children, style, scrolled, freeBottom }: ScreenProps) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      // edges={["bottom", scrolled ? "bottom" : "top"]}
      edges={
        scrolled && freeBottom ? [] : scrolled ? ["bottom"] : ["top", "bottom"]
      }
    >
      <View
        style={[
          styles.content,
          style,
          scrolled && { paddingTop: 0 },
          freeBottom && { paddingBottom: 0 },
        ]}
      >
        {children}
      </View>
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
