import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@/constants/theme";

type DetailRowProps = {
  label: string;
  value: string;
  helper?: string;
};

export function DetailRow({ helper, label, value }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.meta}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  meta: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  helper: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  value: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "700",
  },
});
