import * as Linking from "expo-linking";
import { Href, router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  FileCheck,
  RefreshCcw,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { Button } from "@/components/ui/button";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, spacing } from "@/constants/theme";
import {
  useInitializePermitPayment,
  usePermitRequest,
  useVerifyPermitPayment,
} from "@/features/permit-requests/permit-request-hooks";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date?: string | null) {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amount?: string | number | null, currency = "GHS") {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat(undefined, {
    currency,
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}

function canPay(status?: string) {
  return [
    "draft",
    "pending",
    "awaiting_payment",
    "payment_initialized",
    "payment_failed",
    "failed",
  ].includes(status ?? "");
}

function isPaidStatus(status?: string) {
  return status === "paid" || status === "issued";
}

function getPaymentStatusLabel(status?: string | null) {
  if (!status) {
    return "Not initialized";
  }

  return status.replace(/_/g, " ");
}

export default function PermitRequestDetailScreen() {
  const params = useLocalSearchParams();
  const reference = firstParam(params.reference);
  const shouldAutoPay = firstParam(params.pay) === "1";
  const autoPayStartedRef = useRef(false);
  const requestQuery = usePermitRequest(reference);
  const initializeMutation = useInitializePermitPayment();
  const verifyMutation = useVerifyPermitPayment();
  const request = requestQuery.data;
  const [paymentStarted, setPaymentStarted] = useState(false);
  const refreshControl = usePullToRefresh(async () => {
    await requestQuery.refetch();
  });
  const hasActivePayment = Boolean(
    request?.payment?.reference ||
      request?.payment?.authorization_url ||
      request?.status === "payment_initialized",
  );
  const canStartOrContinuePayment = canPay(request?.status);
  const paymentTone = isPaidStatus(request?.status)
    ? "success"
    : hasActivePayment
      ? "primary"
      : "muted";
  const statusLabel = useMemo(
    () => (request?.status ?? "unknown").replace(/_/g, " "),
    [request?.status],
  );

  const handleInitializePayment = useCallback(async () => {
    if (!reference) {
      return;
    }

    try {
      const callbackUrl = Linking.createURL(
        `/(student)/permit-request/payment-return?request_reference=${encodeURIComponent(
          reference,
        )}`,
      );
      const payment = await initializeMutation.mutateAsync({
        callbackUrl,
        reference,
      });

      setPaymentStarted(true);
      const result = await WebBrowser.openBrowserAsync(payment.authorization_url);

      if (result.type === "cancel" || result.type === "dismiss") {
        Alert.alert(
          "Payment not verified",
          "If you completed payment, use the verify payment button below.",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The Paystack checkout could not be opened.";

      Alert.alert("Unable to open Paystack", message);
    }
  }, [initializeMutation, reference]);

  useEffect(() => {
    if (
      !shouldAutoPay ||
      autoPayStartedRef.current ||
      !request ||
      !reference ||
      !canPay(request.status)
    ) {
      return;
    }

    autoPayStartedRef.current = true;
    void handleInitializePayment();
  }, [handleInitializePayment, reference, request, shouldAutoPay]);

  async function handleVerifyPayment() {
    if (!reference) {
      return;
    }

    try {
      const verifiedRequest = await verifyMutation.mutateAsync({
        reference,
        payload: { reference: request?.payment?.reference ?? undefined },
      });
      await requestQuery.refetch();

      if (verifiedRequest.status === "issued" || verifiedRequest.status === "paid") {
        router.replace(
          `/(student)/permit-request/${verifiedRequest.request_reference}` as Href,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Payment verification could not be completed.";

      Alert.alert("Unable to verify payment", message);
    }
  }

  function handleViewPermits() {
    router.replace("/(student)/(tabs)/permits" as Href);
  }

  function handleRefreshStatus() {
    void requestQuery.refetch();
  }

  const isVerifying = verifyMutation.isPending;
  const isInitializing = initializeMutation.isPending;

  function renderPaymentActions() {
    if (isPaidStatus(request?.status)) {
      return (
        <Button
          icon={FileCheck}
          label="View My Permits"
          onPress={handleViewPermits}
        />
      );
    }

    return (
      <>
        {canStartOrContinuePayment ? (
          <Button
            icon={CreditCard}
            label={hasActivePayment ? "Continue Payment" : "Pay with Paystack"}
            loading={isInitializing}
            onPress={handleInitializePayment}
          />
        ) : null}
        <Button
          icon={RefreshCcw}
          label={isVerifying ? "Verifying Payment" : "I Have Paid, Verify Payment"}
          loading={isVerifying}
          onPress={handleVerifyPayment}
          variant="secondary"
        />
        <Button
          label="Refresh Status"
          onPress={handleRefreshStatus}
          variant="secondary"
        />
      </>
    );
  }

  return (
    <Screen scrolled>
      <AppRefreshableScrollView
        contentContainerStyle={styles.content}
        onRefresh={refreshControl.onRefresh}
        refreshing={refreshControl.refreshing}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Permit"
          onBack={() => router.back()}
          subtitle="Track payment and backend verification status."
          title="Permit Request"
        />

        {requestQuery.isLoading ? (
          <LoadingState message="Loading request..." />
        ) : requestQuery.isError || !request ? (
          <EmptyState
            description="This permit request could not be loaded."
            icon={RefreshCcw}
            title="Unable to load request"
          />
        ) : (
          <>
            <View style={styles.summaryPanel}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.summaryEyebrow}>Request</Text>
                  <Text style={styles.summaryTitle}>{request.request_reference}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    isPaidStatus(request.status)
                      ? styles.statusPillSuccess
                      : styles.statusPillDefault,
                  ]}
                >
                  {isPaidStatus(request.status) ? (
                    <CheckCircle2 color={colors.success} size={14} strokeWidth={2.5} />
                  ) : (
                    <Clock3 color={colors.primary} size={14} strokeWidth={2.5} />
                  )}
                  <Text
                    style={[
                      styles.statusPillText,
                      isPaidStatus(request.status) && styles.statusPillTextSuccess,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryMetric}>
                  <Text style={styles.metricLabel}>Amount</Text>
                  <Text style={styles.metricValue}>
                    {formatMoney(request.amount, request.currency)}
                  </Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.metricLabel}>Expires</Text>
                  <Text style={styles.metricValue}>
                    {formatDate(request.expires_at)}
                  </Text>
                </View>
              </View>
            </View>

            {(canStartOrContinuePayment || hasActivePayment || request.payment) ? (
              <SectionCard title="Payment">
                <View
                  style={[
                    styles.paymentBanner,
                    paymentTone === "success"
                      ? styles.paymentBannerSuccess
                      : paymentTone === "primary"
                        ? styles.paymentBannerPrimary
                        : styles.paymentBannerMuted,
                  ]}
                >
                  <View style={styles.paymentIcon}>
                    <CreditCard color={colors.primary} size={18} strokeWidth={2.4} />
                  </View>
                  <View style={styles.paymentCopy}>
                    <Text style={styles.paymentTitle}>
                      {isPaidStatus(request.status)
                        ? "Payment confirmed"
                        : hasActivePayment
                          ? "Payment initialized"
                          : "Payment required"}
                    </Text>
                    <Text style={styles.paymentSubtitle}>
                      {request.payment?.reference
                        ? `Reference: ${request.payment.reference}`
                        : "Open Paystack, complete payment, then verify below."}
                    </Text>
                  </View>
                </View>

                <DetailRow
                  label="Payment Status"
                  value={getPaymentStatusLabel(request.payment?.status)}
                  helper={request.payment?.paid_at ? `Paid ${formatDate(request.payment.paid_at)}` : undefined}
                />

                {paymentStarted ? (
                  <View style={styles.inlineNotice}>
                    <ExternalLink color={colors.primary} size={16} strokeWidth={2.4} />
                    <Text style={styles.inlineNoticeText}>
                      Paystack opened in your browser. Return here after payment
                      and verify with the backend.
                    </Text>
                  </View>
                ) : null}

                {renderPaymentActions()}
              <Text style={styles.helper}>
                Redirects are not treated as proof of payment. The app always
                asks the backend to verify with Paystack.
              </Text>
            </SectionCard>
            ) : null}

            {request.permit ? (
              <SectionCard title="Issued Permit">
                <DetailRow
                  label="Permit"
                  value="Permit issued"
                  helper="Your student permit list will refresh automatically."
                />
              </SectionCard>
            ) : null}

            {request.status === "issued" || request.status === "paid" ? (
              <Button
                icon={FileCheck}
                label="View My Permits"
                onPress={handleViewPermits}
              />
            ) : null}
          </>
        )}
      </AppRefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.pageHeader,
  },
  summaryPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  summaryEyebrow: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  summaryTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
    marginTop: 2,
  },
  statusPill: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  statusPillDefault: {
    backgroundColor: colors.primarySoft,
  },
  statusPillSuccess: {
    backgroundColor: colors.successSoft,
  },
  statusPillText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  statusPillTextSuccess: {
    color: colors.success,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryMetric: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "800",
  },
  paymentBanner: {
    alignItems: "flex-start",
    borderRadius: 8,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  paymentBannerPrimary: {
    backgroundColor: colors.primarySoft,
  },
  paymentBannerMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  paymentBannerSuccess: {
    backgroundColor: colors.successSoft,
  },
  paymentIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  paymentCopy: {
    flex: 1,
    gap: 3,
  },
  paymentTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
  paymentSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  inlineNotice: {
    alignItems: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  inlineNoticeText: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  helper: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
