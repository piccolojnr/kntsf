import { StudentCard } from "@/features/cards/card-types";
import { Permit, PermitIssuanceConfig } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";

export type ScanDecision =
  | "allowed"
  | "denied"
  | "card_not_registered"
  | "card_inactive"
  | "no_active_permit"
  | "expired_permit"
  | "revoked_permit";

export type VerificationMethod = "student_id" | "card_uid";

export type VerificationLog = {
  id: string;
  method: VerificationMethod;
  value: string;
  scannedAt: string;
  decision: ScanDecision;
  message: string;
  cardId?: string;
  permitId?: string;
  studentId?: string;
};

export type VerificationResult = {
  status: ScanDecision;
  decision: ScanDecision;
  message: string;
  method: VerificationMethod;
  value: string;
  student: Student | null;
  card: StudentCard | null;
  permit: Permit | null;
  canIssuePermit?: boolean;
  issuanceConfig?: PermitIssuanceConfig | null;
  log: VerificationLog;
};

export type ScanLog = VerificationLog;
export type ScanCardResult = VerificationResult;
