import { Student, StudentDto } from "@/features/students/student-types";

export type PermitStatus = "active" | "expired" | "revoked";

export type Permit = {
  id: string;
  studentId: string;
  permitCode: string;
  status: PermitStatus;
  startDate: string;
  expiryDate: string;
  amountPaid: number;
  qrCode?: string;
  student?: Student | null;
};

export type PermitIssuanceConfig = {
  enabled: boolean;
  defaultAmount: number;
  currency?: string;
  expiryDate: string;
  academicYear: string | null;
};

export type PermitDto = Partial<Permit> & {
  id: string | number;
  student_id?: string;
  permit_code?: string;
  originalCode?: string;
  permitHash?: string;
  code?: string;
  start_date?: string;
  expiry_date?: string;
  expiresAt?: string;
  amount_paid?: number;
  amount?: number;
  student?: Student | StudentDto | null;
};
export type PermitIssuanceConfigDto = PermitIssuanceConfig;
