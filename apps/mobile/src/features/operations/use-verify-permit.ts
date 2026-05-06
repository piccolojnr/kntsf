import { useCallback, useMemo, useRef, useState } from "react";

import { issuePermitForStudent } from "@/features/permits/permit-api";
import { Permit } from "@/features/permits/permit-types";
import {
  getStudentById,
  getStudentByStudentId,
} from "@/features/students/student-api";
import { Student } from "@/features/students/student-types";

import {
  scanCardByUid,
  verifyPermitByStudentId,
} from "./scan-api";
import { VerificationResult } from "./scan-types";

type UseVerifyPermitState = {
  loading: boolean;
  result: VerificationResult | null;
  error: string | null;
  success: boolean;
};

export type UseVerifyPermitReturn = UseVerifyPermitState & {
  currentStudent: Student | null;
  currentPermit: Permit | null;
  verifyByStudentId: (studentId: string) => Promise<VerificationResult>;
  verifyByCardUid: (uid: string) => Promise<VerificationResult>;
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

export function useVerifyPermit(): UseVerifyPermitReturn {
  const [state, setState] = useState<UseVerifyPermitState>({
    loading: false,
    result: null,
    error: null,
    success: false,
  });
  const operationIdRef = useRef(0);

  const currentStudent = state.result?.student ?? null;
  const currentPermit = state.result?.permit ?? null;

  const beginOperation = useCallback((options?: { clearResult?: boolean }) => {
    operationIdRef.current += 1;
    const operationId = operationIdRef.current;

    setState((current) => ({
      loading: true,
      error: null,
      success: false,
      result: options?.clearResult ? null : current.result,
    }));

    return operationId;
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
    });

    return true;
  }, []);

  const verifyByStudentId = useCallback(
    async (studentId: string) => {
      const operationId = beginOperation({ clearResult: true });

      try {
        const nextResult = await verifyPermitByStudentId(studentId);
        commitSuccess(operationId, nextResult);
        return nextResult;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Verification failed.";
        commitFailure(operationId, message);
        throw error;
      }
    },
    [beginOperation, commitFailure, commitSuccess],
  );

  const verifyByCardUid = useCallback(
    async (uid: string) => {
      const operationId = beginOperation({ clearResult: true });

      try {
        const nextResult = await scanCardByUid(uid);
        commitSuccess(operationId, nextResult);
        return nextResult;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Verification failed.";
        commitFailure(operationId, message);
        throw error;
      }
    },
    [beginOperation, commitFailure, commitSuccess],
  );

  const issuePermit = useCallback(
    async (studentId: string) => {
      const operationId = beginOperation();

      try {
        const student = await resolveStudentRecord(studentId, currentStudent);

        if (!student) {
          throw new Error("No student record was found for this student ID.");
        }

        const issuedPermit = await issuePermitForStudent(student.id);
        const refreshedResult = await verifyPermitByStudentId(student.studentId);
        const nextResult: VerificationResult = {
          ...refreshedResult,
          message: "Permit issued successfully.",
          permit: issuedPermit,
        };
        commitSuccess(operationId, nextResult);

        return issuedPermit;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Permit issuance failed.";
        commitFailure(operationId, message);
        throw error;
      }
    },
    [beginOperation, commitFailure, commitSuccess, currentStudent],
  );

  const reset = useCallback(() => {
    operationIdRef.current += 1;
    setState({
      loading: false,
      result: null,
      error: null,
      success: false,
    });
  }, []);

  return useMemo(
    () => ({
      loading: state.loading,
      result: state.result,
      error: state.error,
      success: state.success,
      currentStudent,
      currentPermit,
      verifyByStudentId,
      verifyByCardUid,
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
      state.result,
      state.success,
      verifyByCardUid,
      verifyByStudentId,
    ],
  );
}
