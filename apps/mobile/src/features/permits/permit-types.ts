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
  currency: string;
  codeLast4?: string | null;
  academicPeriod?: Record<string, unknown> | null;
  qrCode?: string;
  student?: Student | null;
};

export type PermitIssuanceConfig = {
  enabled: boolean;
  defaultAmount: number;
  currency?: string;
  startDate?: string;
  expiryDate: string;
  academicYear: string | null;
  semester?: string | null;
  validityDays?: number | null;
  permitRequestsEnabled?: boolean;
  activeAcademicPeriod?: {
    id?: string | number;
    name?: string | null;
    academic_year?: string | null;
    semester?: string | null;
  } | null;
  courseOptions?: string[];
  levelOptions?: string[];
  studentNumberPrefix?: string | null;
  selectedStudent?: Student | null;
  blocking?: {
    hasActivePermit: boolean;
    hasOpenPermitRequest: boolean;
    missingEmail: boolean;
    missingPhone: boolean;
    reasons: string[];
  };
};

export type PermitDto = Partial<Permit> & {
  id: string | number;
  student_id?: string;
  permit_code?: string;
  code_last4?: string | null;
  originalCode?: string;
  code?: string;
  starts_at?: string;
  expires_at?: string;
  start_date?: string;
  expiry_date?: string;
  expiresAt?: string;
  amount_paid?: string | number;
  amount?: string | number;
  currency?: string;
  academic_period?: Record<string, unknown> | null;
  student?: Student | StudentDto | null;
};
export type PermitIssuanceConfigDto = Partial<PermitIssuanceConfig> & {
  enabled?: boolean;
  issuanceEnabled?: boolean;
  defaultAmount?: number;
  default_amount?: string | number;
  amount?: number;
  currency?: string;
  startDate?: string;
  start_date?: string;
  starts_at?: string;
  default_start_date?: string;
  default_starts_at?: string;
  expiryDate?: string;
  expiry_date?: string;
  expiresAt?: string;
  expires_at?: string;
  default_end_date?: string;
  default_ends_at?: string;
  default_expires_at?: string;
  academicYear?: string | null;
  academic_year?: string | null;
  semester?: string | null;
  validity_days?: number | string | null;
  default_validity_days?: number | string | null;
  validityDays?: number | null;
  permit_requests_enabled?: boolean;
  active_academic_period?: PermitIssuanceConfig["activeAcademicPeriod"];
  course_options?: string[];
  courses?: string[];
  level_options?: string[];
  levels?: string[];
  student_number_prefix?: string | null;
  student?: Student | StudentDto | null;
  selected_student?: Student | StudentDto | null;
  has_active_permit?: boolean;
  has_open_permit_request?: boolean;
  has_pending_request?: boolean;
  open_permit_request_exists?: boolean;
  missing_email?: boolean;
  missing_phone?: boolean;
  missing_contact?: {
    email?: boolean;
    phone?: boolean;
  };
  blocking_reasons?: string[];
  blocking_reason_keys?: string[];
  selected_student_state?: {
    has_active_permit?: boolean;
    has_open_permit_request?: boolean;
    has_pending_request?: boolean;
    missing_email?: boolean;
    missing_phone?: boolean;
    blocking_reasons?: string[];
    reason_keys?: string[];
  };
  blocking?: {
    has_active_permit?: boolean;
    has_open_permit_request?: boolean;
    has_pending_request?: boolean;
    missing_email?: boolean;
    missing_phone?: boolean;
    reasons?: string[];
    reason_keys?: string[];
  };
};
