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
  semester?: string | null;
};

export type PermitDto = Partial<Permit> & {
  id: string | number;
  student_id?: string;
  permit_code?: string;
  originalCode?: string;
  code?: string;
  start_date?: string;
  expiry_date?: string;
  expiresAt?: string;
  amount_paid?: number;
  amount?: number;
  student?: Student | StudentDto | null;
};
export type PermitIssuanceConfigDto = Partial<PermitIssuanceConfig> & {
  enabled?: boolean;
  issuanceEnabled?: boolean;
  defaultAmount?: number;
  amount?: number;
  expiryDate?: string;
  expiry_date?: string;
  expiresAt?: string;
  academicYear?: string | null;
  academic_year?: string | null;
};
