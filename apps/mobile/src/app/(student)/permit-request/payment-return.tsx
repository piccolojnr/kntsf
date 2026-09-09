import { Href, router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, RefreshCcw, XCircle } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, spacing } from "@/constants/theme";
import { useVerifyPermitPayment } from "@/features/permit-requests/permit-request-hooks";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PermitPaymentReturnScreen() {
  const params = useLocalSearchParams();
  const requestReference = useMemo(
    () =>
      firstParam(params.request_reference) ??
      firstParam(params.permit_request_reference) ??
      firstParam(params.reference),
    [params.permit_request_reference, params.reference, params.request_reference],
  );
  const paymentReference = firstParam(params.reference);
  const verifyMutation = useVerifyPermitPayment();

  useEffect(() => {
    if (!requestReference || verifyMutation.isPending || verifyMutation.isSuccess) {
      return;
    }

    verifyMutation.mutate(
      {
        reference: requestReference,
        payload: { reference: paymentReference },
      },
      {
        onSuccess: (request) => {
          setTimeout(() => {
            router.replace(
              `/(student)/permit-request/${request.request_reference}` as Href,
            );
          }, 650);
        },
      },
    );
  }, [paymentReference, requestReference, verifyMutation]);

  return (
    <Screen>
      <View style={styles.content}>
        <PageHeader
          eyebrow="Payment"
          subtitle="Confirming payment with the backend."
          title="Verifying Payment"
        />

        {verifyMutation.isSuccess ? (
          <View style={styles.stateCard}>
            <CheckCircle2 color={colors.success} size={28} strokeWidth={2.4} />
            <Text style={styles.stateTitle}>Payment checked</Text>
            <Text style={styles.message}>
              Returning to your permit request with the latest status.
            </Text>
          </View>
        ) : verifyMutation.isError || !requestReference ? (
          <>
            <View style={styles.stateCard}>
              <XCircle color={colors.danger} size={28} strokeWidth={2.4} />
              <Text style={styles.stateTitle}>Verification failed</Text>
              <Text style={styles.message}>
                Payment verification could not complete automatically. Open your
                request and use the verify payment button.
              </Text>
            </View>
            <Button
              label="Back to Requests"
              onPress={() => router.replace("/(student)/permit-request" as Href)}
              variant="secondary"
            />
          </>
        ) : (
          <View style={styles.stateCard}>
            <RefreshCcw color={colors.primary} size={28} strokeWidth={2.4} />
            <LoadingState message="Verifying payment..." />
            <Text style={styles.message}>
              Please wait while the backend checks Paystack.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 22,
    textAlign: "center",
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  stateTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: "800",
    textAlign: "center",
  },
});
