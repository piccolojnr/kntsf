import { CalendarDays, Hash, ShieldCheck, WalletCards } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Permit } from "@/features/permits/permit-types";

type StudentPermitDetailsCardProps = {
  permit: Permit | null;
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

function formatStatus(status: Permit["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.iconWrap}>
        <Icon color={colors.primary} size={18} strokeWidth={2.4} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function StudentPermitDetailsCard({
  permit,
}: StudentPermitDetailsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Permit</Text>
        <Text style={styles.title}>SRC Permit Details</Text>
      </View>
      {permit ? (
        <View style={styles.details}>
          <DetailItem icon={Hash} label="Permit Code" value={permit.permitCode} />
          <DetailItem
            icon={ShieldCheck}
            label="Status"
            value={formatStatus(permit.status)}
          />
          <DetailItem
            icon={CalendarDays}
            label="Start Date"
            value={formatDate(permit.startDate)}
          />
          <DetailItem
            icon={CalendarDays}
            label="Expiry Date"
            value={formatDate(permit.expiryDate)}
          />
          <DetailItem
            icon={WalletCards}
            label="Amount Paid"
            value={formatCurrency(permit.amountPaid)}
          />
        </View>
      ) : (
        <Text style={styles.emptyText}>
          No permit has been issued for your student record yet.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
  },
  header: {
    gap: 2,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "900",
  },
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  label: {
    color: colors.textMuted,
    flex: 1,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  value: {
    color: colors.text,
    flexShrink: 1,
    fontSize: fontSizes.sm,
    fontWeight: "900",
    textAlign: "right",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
