import { ChevronRight, FileText } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit } from "@/features/permits/permit-types";

type StudentPermitHistoryItemProps = {
  permit: Permit;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    currency: "GHS",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

function getPalette(status: Permit["status"]) {
  switch (status) {
    case "active":
      return { background: colors.successSoft, foreground: colors.success };
    case "expired":
      return { background: colors.warningSoft, foreground: colors.warning };
    case "revoked":
      return { background: colors.dangerSoft, foreground: colors.danger };
  }
}

export function StudentPermitHistoryItem({
  permit,
}: StudentPermitHistoryItemProps) {
  const palette = getPalette(permit.status);

  return (
    <View style={styles.item}>
      <View style={[styles.iconWrap, { backgroundColor: palette.background }]}>
        <FileText color={palette.foreground} size={18} strokeWidth={2.4} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.code}>{permit.permitCode}</Text>
        <Text style={styles.dates}>
          {formatDate(permit.startDate)} - {formatDate(permit.expiryDate)}
        </Text>
        <Text style={styles.amount}>{formatCurrency(permit.amountPaid)}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: palette.background }]}>
        <Text style={[styles.badgeText, { color: palette.foreground }]}>
          {permit.status}
        </Text>
      </View>
      <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  code: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "900",
  },
  dates: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  amount: {
    color: colors.text,
    fontSize: fontSizes.xs,
    fontWeight: "800",
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
