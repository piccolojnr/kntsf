import { Href, router } from "expo-router";
import {
  AlertCircle,
  CreditCard,
  FileText,
  RefreshCcw,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SectionCard } from "@/components/cards/section-card";
import { AppRefreshableScrollView } from "@/components/ui/app-refreshable-scroll-view";
import { Button } from "@/components/ui/button";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { TextField } from "@/components/ui/text-field";
import { colors, fontSizes, spacing } from "@/constants/theme";
import {
  useCreatePermitRequest,
  usePermitRequestOptions,
  usePermitRequests,
} from "@/features/permit-requests/permit-request-hooks";
import { PermitRequest } from "@/features/permit-requests/permit-request-types";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { normalizeApiError } from "@/lib/api/api-error";

function formatMoney(amount?: string | number | null, currency = "GHS") {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat(undefined, {
    currency,
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}

function getPendingRequest(requests: PermitRequest[]) {
  return requests.find((request) =>
    [
      "awaiting_payment",
      "payment_initialized",
      "paid",
      "pending_review",
    ].includes(request.status),
  );
}

function getStudentNumber(student: PermitRequest["student"]) {
  if (!student) {
    return undefined;
  }

  if ("student_number" in student) {
    return student.student_number;
  }

  if ("studentId" in student) {
    return student.studentId;
  }

  return undefined;
}

export default function PermitRequestScreen() {
  const optionsQuery = usePermitRequestOptions();
  const requestsQuery = usePermitRequests();
  const createMutation = useCreatePermitRequest();
  const options = optionsQuery.data;
  const pendingRequest = useMemo(
    () => getPendingRequest(requestsQuery.data ?? []),
    [requestsQuery.data],
  );
  const existingRequest = pendingRequest ?? options?.pending_request ?? null;
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!options) {
      return;
    }

    setContactEmail((current) => current || options.student?.email || "");
    setContactPhone((current) => current || options.student?.phone || "");
  }, [options]);

  const isLoading = optionsQuery.isLoading || requestsQuery.isLoading;
  const hasError = optionsQuery.isError || requestsQuery.isError;
  const refreshControl = usePullToRefresh(async () => {
    await Promise.all([optionsQuery.refetch(), requestsQuery.refetch()]);
  });

  const blockers = useMemo(() => {
    if (!options) {
      return [];
    }

    return [
      !options.permit_requests_enabled
        ? "Permit requests are currently disabled."
        : null,
      options.has_active_permit ? "You already have an active permit." : null,
      options.has_pending_request || existingRequest
        ? "You already have a pending permit request."
        : null,
      options.missing_contact.email && !contactEmail.trim()
        ? "A contact email is required."
        : null,
      options.missing_contact.phone && !contactPhone.trim()
        ? "A contact phone number is required."
        : null,
    ].filter((item): item is string => Boolean(item));
  }, [contactEmail, contactPhone, existingRequest, options]);

  async function handleCreateRequest() {
    setSubmitError(null);

    try {
      const payload = {
        contact_email:
          contactEmail.trim() || options?.student?.email || undefined,
        contact_phone:
          contactPhone.trim() || options?.student?.phone || undefined,
      };
      const request = await createMutation.mutateAsync(payload);

      router.push(
        `/(student)/permit-request/${request.request_reference}?pay=1` as Href,
      );
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      const fieldMessage =
        normalizedError.fields?.contact_email?.[0] ??
        normalizedError.fields?.email?.[0] ??
        normalizedError.fields?.contact_phone?.[0] ??
        normalizedError.message;

      setSubmitError(fieldMessage);
    }
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
          subtitle="Request a permit and pay securely through Paystack."
          title="Request Permit"
        />

        {isLoading ? (
          <LoadingState message="Loading permit request options..." />
        ) : hasError || !options ? (
          <EmptyState
            description="Permit request options could not be loaded."
            icon={RefreshCcw}
            title="Unable to load"
          />
        ) : (
          <>
            <SectionCard title="Request Details">
              <DetailRow
                label="Academic Period"
                value={options.active_academic_period?.name ?? "Not available"}
                helper={[
                  options.active_academic_period?.academic_year,
                  options.active_academic_period?.semester,
                ]
                  .filter(Boolean)
                  .join(" - ")}
              />
              <DetailRow
                label="Amount"
                value={formatMoney(options.default_amount, options.currency)}
              />
              <DetailRow
                label="Student"
                value={options.student?.name ?? "Linked student account"}
                helper={getStudentNumber(options.student)}
              />
            </SectionCard>

            {options.missing_contact.email || options.missing_contact.phone ? (
              <SectionCard title="Contact Details">
                {options.missing_contact.email ? (
                  <TextField
                    autoCapitalize="none"
                    keyboardType="email-address"
                    label="Contact Email"
                    onChangeText={setContactEmail}
                    placeholder="student@example.com"
                    value={contactEmail}
                  />
                ) : null}
                {options.missing_contact.phone ? (
                  <TextField
                    keyboardType="phone-pad"
                    label="Contact Phone"
                    onChangeText={setContactPhone}
                    placeholder="0240000000"
                    value={contactPhone}
                  />
                ) : null}
              </SectionCard>
            ) : null}

            {existingRequest ? (
              <SectionCard title="Existing Request">
                <DetailRow
                  label="Reference"
                  value={existingRequest.request_reference}
                  helper={`Status: ${existingRequest.status}`}
                />
                <Button
                  icon={FileText}
                  label="View Request"
                  onPress={() =>
                    router.push(
                      `/(student)/permit-request/${existingRequest.request_reference}` as Href,
                    )
                  }
                />
              </SectionCard>
            ) : null}

            {blockers.length > 0 ? (
              <View style={styles.warning}>
                <AlertCircle color={colors.warning} size={18} />
                <View style={styles.warningCopy}>
                  {blockers.map((blocker) => (
                    <Text key={blocker} style={styles.warningText}>
                      {blocker}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}

            {submitError ? (
              <View style={styles.warning}>
                <AlertCircle color={colors.danger} size={18} />
                <Text style={[styles.warningText, { color: colors.danger }]}>
                  {submitError}
                </Text>
              </View>
            ) : null}

            <Button
              disabled={blockers.length > 0}
              icon={CreditCard}
              label="Create Permit Request"
              loading={createMutation.isPending}
              onPress={handleCreateRequest}
            />
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
  warning: {
    alignItems: "flex-start",
    backgroundColor: colors.warningSoft,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  warningCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  warningText: {
    color: colors.warning,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    lineHeight: 20,
  },
});
