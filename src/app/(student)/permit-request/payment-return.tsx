import { Href, router, useLocalSearchParams } from "expo-router";
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
          router.replace(
            `/(student)/permit-request/${request.request_reference}` as Href,
          );
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

        {verifyMutation.isError || !requestReference ? (
          <>
            <Text style={styles.message}>
              Payment verification could not complete automatically. Open your
              request and use the verify payment button.
            </Text>
            <Button
              label="Back to Requests"
              onPress={() => router.replace("/(student)/permit-request" as Href)}
              variant="secondary"
            />
          </>
        ) : (
          <LoadingState message="Verifying payment..." />
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
});
