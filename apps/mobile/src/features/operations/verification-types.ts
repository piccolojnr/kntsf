import { StudentCard } from "@/features/cards/card-types";
import { Permit, PermitIssuanceConfig } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";

export type VerificationOutcome = "allowed" | "denied" | "warning";

export type VerificationReason =
  | "active_permit"
  | "expired_permit"
  | "revoked_permit"
  | "no_active_permit"
  | "card_not_registered"
  | "card_inactive"
  | "student_not_found"
  | "permit_not_found"
  | "permit_issuance_disabled"
  | "invalid_input"
  | "unknown_error";

export type VerificationMethod = "student_id" | "card_uid" | "permit_code";

export type VerificationDecision =
  | "allowed"
  | "denied"
  | "card_not_registered"
  | "card_inactive"
  | "no_active_permit"
  | "expired_permit"
  | "revoked_permit";

export type VerificationLog = {
  id: string;
  method: VerificationMethod;
  value: string;
  scannedAt: string;
  checkedAt: string;
  outcome: VerificationOutcome;
  reason: VerificationReason;
  decision: VerificationDecision;
  message: string;
  cardId?: string;
  permitId?: string;
  studentId?: string;
};

export type VerificationResult = {
  outcome: VerificationOutcome;
  reason: VerificationReason;
  checkedAt: string;
  message: string;
  method: VerificationMethod;
  value: string;
  student: Student | null;
  card: StudentCard | null;
  permit: Permit | null;
  canIssuePermit?: boolean;
  issuanceConfig?: PermitIssuanceConfig | null;
  log: VerificationLog;
  /**
   * Compatibility fields for the current UI. New backend code should prefer
   * outcome + reason.
   */
  status: VerificationDecision;
  decision: VerificationDecision;
};

export type VerificationLogDto = VerificationLog;
export type VerificationResultDto = VerificationResult;

export type ScanDecision = VerificationDecision;
export type ScanLog = VerificationLog;
export type ScanCardResult = VerificationResult;
