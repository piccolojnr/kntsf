import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import {
  createPermitRequest,
  getPermitRequest,
  getPermitRequestOptions,
  getPermitRequests,
  initializePermitPayment,
  verifyPermitPayment,
} from "./permit-request-api";
import { CreatePermitRequestPayload, VerifyPaymentPayload } from "./permit-request-types";

function useInvalidatePermitRequestQueries() {
  const queryClient = useQueryClient();

  return async (reference?: string | null) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.permitRequests.lists() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.permitRequests.options() }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.permitRequests.detail(reference),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.permits.student() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.content.home() }),
    ]);
  };
}

export function usePermitRequestOptions() {
  return useQuery({
    queryKey: queryKeys.permitRequests.options(),
    queryFn: getPermitRequestOptions,
  });
}

export function usePermitRequests() {
  return useQuery({
    queryKey: queryKeys.permitRequests.lists(),
    queryFn: getPermitRequests,
  });
}

export function usePermitRequest(reference?: string | null) {
  return useQuery({
    enabled: Boolean(reference),
    queryKey: queryKeys.permitRequests.detail(reference),
    queryFn: () => getPermitRequest(reference ?? ""),
  });
}

export function useCreatePermitRequest() {
  const invalidate = useInvalidatePermitRequestQueries();

  return useMutation({
    mutationFn: (payload?: CreatePermitRequestPayload) =>
      createPermitRequest(payload),
    onSuccess: async (request) => {
      await invalidate(request.request_reference);
    },
  });
}

export function useInitializePermitPayment() {
  const invalidate = useInvalidatePermitRequestQueries();

  return useMutation({
    mutationFn: (reference: string) => initializePermitPayment(reference),
    onSuccess: async (payment) => {
      await invalidate(payment.permit_request_reference);
    },
  });
}

export function useVerifyPermitPayment() {
  const invalidate = useInvalidatePermitRequestQueries();

  return useMutation({
    mutationFn: ({
      reference,
      payload,
    }: {
      reference: string;
      payload?: VerifyPaymentPayload;
    }) => verifyPermitPayment(reference, payload),
    onSuccess: async (request) => {
      await invalidate(request.request_reference);
    },
  });
}
