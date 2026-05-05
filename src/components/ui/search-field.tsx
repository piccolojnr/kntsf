import { Search } from "lucide-react-native";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type SearchFieldProps = TextInputProps;

export function SearchField(props: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <Search color={colors.textMuted} size={16} strokeWidth={2.5} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    elevation: 2,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    padding: 0,
  },
});
