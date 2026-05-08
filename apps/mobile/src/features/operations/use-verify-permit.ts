import { useCallback, useMemo, useRef, useState } from "react";

import { USE_MOCK_API } from "@/constants/config";
import { Permit } from "@/features/permits/permit-types";
import {
  getStudentById,
  getStudentByStudentId,
} from "@/features/students/student-api";
import { Student } from "@/features/students/student-types";
import { normalizeApiError } from "@/lib/api/api-error";
import { readCardUid } from "@/lib/nfc/nfc-service";

import {
  issuePermitWithVerification as issuePermitRequest,
  scanCardByUid,
  verifyPermitByStudentId,
} from "./verification-api";
import { VerificationResult } from "./verification-types";

export type VerificationPhase =
  | "idle"
  | "verifying_student_id"
  | "reading_nfc"
  | "nfc_read_success"
  | "verifying_card_uid"
  | "issuing_permit"
  | "success"
  | "error";

type UseVerifyPermitState = {
  loading: boolean;
  result: VerificationResult | null;
  error: string | null;
  success: boolean;
  phase: VerificationPhase;
};

export type UseVerifyPermitReturn = UseVerifyPermitState & {
  currentStudent: Student | null;
  currentPermit: Permit | null;
  verifyByStudentId: (studentId: string) => Promise<VerificationResult>;
  verifyByCardUid: (uid: string) => Promise<VerificationResult>;
  verifyByNfc: () => Promise<VerificationResult>;
  issuePermit: (studentId: string) => Promise<Permit>;
  reset: () => void;
};

async function resolveStudentRecord(studentId: string, currentStudent?: Student | null) {
  const normalizedStudentId = studentId.trim();

  if (
    currentStudent &&
    (currentStudent.id === normalizedStudentId ||
      currentStudent.studentId === normalizedStudentId)
  ) {
    return currentStudent;
  }

  const matchedByStudentId = await getStudentByStudentId(normalizedStudentId);

  if (matchedByStudentId) {
    return matchedByStudentId;
  }

  return getStudentById(normalizedStudentId);
}

function getSafeNfcErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unknown error";
  }

  switch (error.message) {
    case "NFC not supported":
    case "NFC disabled":
    case "Scan cancelled":
    case "No card detected":
    case "Unknown error":
      return error.message;
    default:
      return "Unknown error";
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useVerifyPermit(): UseVerifyPermitReturn {
  const [state, setState] = useState<UseVerifyPermitState>({
    loading: false,
    result: null,
    error: null,
    success: false,
    phase: "idle",
  });
  const operationIdRef = useRef(0);
  const nfcVerificationRef = useRef<Promise<VerificationResult> | null>(null);

  const currentStudent = state.result?.student ?? null;
  const currentPermit = state.result?.permit ?? null;

  const beginOperation = useCallback((options?: { clearResult?: boolean; phase?: VerificationPhase }) => {
    operationIdRef.current += 1;
    const operationId = operationIdRef.current;

    setState((current) => ({
      loading: true,
      error: null,
      success: false,
      phase: options?.phase ?? "verifying_student_id",
      result: options?.clearResult ? null : current.result,
    }));

    return operationId;
  }, []);

  const updatePhase = useCallback((operationId: number, phase: VerificationPhase) => {
    if (operationId !== operationIdRef.current) {
      return false;
    }

    setState((current) => ({
      ...current,
      phase,
    }));

    return true;
  }, []);

  const commitSuccess = useCallback(
    (operationId: number, result: VerificationResult | null) => {
      if (operationId !== operationIdRef.current) {
        return false;
      }

      setState({
        loading: false,
        result,
        error: null,
        success: true,
        phase: "success",
      });

      return true;
    },
    [],
  );

  const commitFailure = useCallback((operationId: number, message: string) => {
    if (operationId !== operationIdRef.current) {
      return false;
    }

    setState({
      loading: false,
      result: null,
      error: message,
      success: false,
      phase: "error",
    });

    return true;
  }, []);

  const verifyByStudentId = useCallback(
    async (studentId: string) => {
      const operationId = beginOperation({
        clearResult: true,
        phase: "verifying_student_id",
      });

      try {
        const nextResult = await verifyPermitByStudentId(studentId);
        commitSuccess(operationId, nextResult);
        return nextResult;
      } catch (error) {
        const message = normalizeApiError(error).message;
        commitFailure(operationId, message);
        throw error;
      }
    },
    [beginOperation, commitFailure, commitSuccess],
  );

  const runCardUidVerification = useCallback(
    async (uid: string, operationId: number) => {
      try {
        const nextResult = await scanCardByUid(uid);
        commitSuccess(operationId, nextResult);
        return nextResult;
      } catch (error) {
        const message = normalizeApiError(error).message;
        commitFailure(operationId, message);
        throw error;
      }
    },
    [commitFailure, commitSuccess],
  );

  const verifyByCardUid = useCallback(
    async (uid: string) => {
      const operationId = beginOperation({
        clearResult: true,
        phase: "verifying_card_uid",
      });

      return runCardUidVerification(uid, operationId);
    },
    [beginOperation, runCardUidVerification],
  );

  const verifyByNfc = useCallback(async () => {
    if (nfcVerificationRef.current) {
      return nfcVerificationRef.current;
    }

    const operationId = beginOperation({
      clearResult: true,
      phase: "reading_nfc",
    });

    const nfcVerification = (async () => {
      try {
        const uid = await readCardUid();

        if (!uid) {
          const message = "No card detected";
          commitFailure(operationId, message);
          throw new Error(message);
        }

        updatePhase(operationId, "nfc_read_success");
        await delay(450);
        updatePhase(operationId, "verifying_card_uid");

        return await runCardUidVerification(uid, operationId);
      } catch (error) {
        if (operationId !== operationIdRef.current) {
          throw error;
        }

        const message = getSafeNfcErrorMessage(error);

        commitFailure(operationId, message);
        throw new Error(message);
      }
    })();

    nfcVerificationRef.current = nfcVerification.finally(() => {
      nfcVerificationRef.current = null;
    });

    return nfcVerificationRef.current;
  }, [beginOperation, commitFailure, runCardUidVerification, updatePhase]);

  const issuePermit = useCallback(
    async (studentId: string) => {
      const operationId = beginOperation({ phase: "issuing_permit" });

      try {
        const student = !USE_MOCK_API
          ? currentStudent
          : await resolveStudentRecord(studentId, currentStudent);

        if (!student) {
          throw new Error("No student record was found for this student ID.");
        }

        const response = await issuePermitRequest(student.studentId ?? student.id);
        const issuedPermit = response.permit;
        const refreshedResult =
          response.verification ?? (await verifyPermitByStudentId(student.studentId));
        const nextResult: VerificationResult = {
          ...refreshedResult,
          message: "Permit issued successfully.",
          permit: issuedPermit,
        };
        commitSuccess(operationId, nextResult);

        return issuedPermit;
      } catch (error) {
        const message = normalizeApiError(error).message;
        commitFailure(operationId, message);
        throw error;
      }
    },
    [beginOperation, commitFailure, commitSuccess, currentStudent],
  );

  const reset = useCallback(() => {
    operationIdRef.current += 1;
    nfcVerificationRef.current = null;
    setState({
      loading: false,
      result: null,
      error: null,
      success: false,
      phase: "idle",
    });
  }, []);

  return useMemo(
    () => ({
      loading: state.loading,
      result: state.result,
      error: state.error,
      success: state.success,
      phase: state.phase,
      currentStudent,
      currentPermit,
      verifyByStudentId,
      verifyByCardUid,
      verifyByNfc,
      issuePermit,
      reset,
    }),
    [
      currentPermit,
      currentStudent,
      issuePermit,
      reset,
      state.error,
      state.loading,
      state.phase,
      state.result,
      state.success,
      verifyByCardUid,
      verifyByNfc,
      verifyByStudentId,
    ],
  );
}
