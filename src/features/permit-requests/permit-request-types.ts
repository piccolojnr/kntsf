import { Permit } from "@/features/permits/permit-types";
import { Student, StudentDto } from "@/features/students/student-types";

export type PermitRequestStatus =
  | "draft"
  | "awaiting_payment"
  | "payment_initialized"
  | "paid"
  | "pending_review"
  | "issued"
  | "failed"
  | "cancelled"
  | "expired"
  | string;

export type PermitRequestStudent = Student | StudentDto | {
  id?: string | number;
  student_number?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type PermitRequestAcademicPeriod = {
  id?: string | number;
  name?: string;
  academic_year?: string;
  semester?: string;
};

export type PaymentSummary = {
  reference?: string | null;
  status?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  authorization_url?: string | null;
  paid_at?: string | null;
  verified_at?: string | null;
};

export type PermitRequest = {
  request_reference: string;
  status: PermitRequestStatus;
  amount: string;
  currency: string;
  contact_email: string | null;
  contact_phone: string | null;
  requires_review: boolean;
  review_status: string | null;
  expires_at: string | null;
  student?: PermitRequestStudent | null;
  payment?: PaymentSummary | null;
  permit?: Permit | Record<string, unknown> | null;
};

export type PermitRequestOptions = {
  active_academic_period: PermitRequestAcademicPeriod | null;
  default_amount: string;
  currency: string;
  permit_requests_enabled: boolean;
  student: PermitRequestStudent | null;
  has_active_permit: boolean;
  has_pending_request: boolean;
  missing_contact: {
    email: boolean;
    phone: boolean;
  };
};

export type CreatePermitRequestPayload = {
  contact_email?: string;
  contact_phone?: string;
};

export type PaymentInitialization = {
  authorization_url: string;
  access_code?: string;
  reference: string;
  permit_request_reference: string;
};

export type VerifyPaymentPayload = {
  reference?: string;
};
