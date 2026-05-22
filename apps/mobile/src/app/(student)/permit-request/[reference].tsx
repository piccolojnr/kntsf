import * as Linking from "expo-linking";
import { Href, router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { CreditCard, FileCheck, RefreshCcw } from "lucide-react-native";
import { Alert, StyleSheet, Text } from "react-native";

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
  return status === "awaiting_payment" || status === "payment_initialized";
}

export default function PermitRequestDetailScreen() {
  const params = useLocalSearchParams();
  const reference = firstParam(params.reference);
  const requestQuery = usePermitRequest(reference);
  const initializeMutation = useInitializePermitPayment();
  const verifyMutation = useVerifyPermitPayment();
  const request = requestQuery.data;
  const refreshControl = usePullToRefresh(async () => {
    await requestQuery.refetch();
  });

  async function handleInitializePayment() {
    if (!reference) {
      return;
    }

    const payment = await initializeMutation.mutateAsync(reference);
    const returnUrl = Linking.createURL(
      `/(student)/permit-request/payment-return?request_reference=${encodeURIComponent(
        payment.permit_request_reference,
      )}&reference=${encodeURIComponent(payment.reference)}`,
    );

    const result = await WebBrowser.openAuthSessionAsync(
      payment.authorization_url,
      returnUrl,
    );

    if (result.type === "success") {
      router.push(result.url as Href);
      return;
    }

    Alert.alert(
      "Payment not verified",
      "If you completed payment, use the verify payment button below.",
    );
  }

  async function handleVerifyPayment() {
    if (!reference) {
      return;
    }

    await verifyMutation.mutateAsync({
      reference,
      payload: { reference: request?.payment?.reference ?? undefined },
    });
    await requestQuery.refetch();
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
            <SectionCard title="Status">
              <DetailRow
                label="Reference"
                value={request.request_reference}
                helper={`Status: ${request.status}`}
              />
              <DetailRow
                label="Amount"
                value={formatMoney(request.amount, request.currency)}
              />
              <DetailRow label="Expires" value={formatDate(request.expires_at)} />
            </SectionCard>

            <SectionCard title="Payment">
              <DetailRow
                label="Payment Status"
                value={request.payment?.status ?? "Not initialized"}
                helper={request.payment?.reference ?? undefined}
              />
              {canPay(request.status) ? (
                <Button
                  icon={CreditCard}
                  label="Pay with Paystack"
                  loading={initializeMutation.isPending}
                  onPress={handleInitializePayment}
                />
              ) : null}
              <Button
                icon={RefreshCcw}
                label="I Have Paid, Verify Payment"
                loading={verifyMutation.isPending}
                onPress={handleVerifyPayment}
                variant="secondary"
              />
              <Text style={styles.helper}>
                Redirects are not treated as proof of payment. The app always
                asks the backend to verify with Paystack.
              </Text>
            </SectionCard>

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
                onPress={() =>
                  router.replace("/(student)/(tabs)/permits" as Href)
                }
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
  helper: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
