import { StudentCard } from "@/features/cards/card-types";
import { Permit } from "@/features/permits/permit-types";
import { Student } from "@/features/students/student-types";

export type ScanDecision =
  | "allowed"
  | "denied"
  | "card_not_registered"
  | "card_inactive"
  | "no_active_permit"
  | "expired_permit";

export type ScanLog = {
  id: string;
  uid: string;
  scannedAt: string;
  decision: ScanDecision;
  message: string;
  cardId?: string;
  permitId?: string;
  studentId?: string;
};

export type ScanCardResult = {
  decision: ScanDecision;
  message: string;
  student: Student | null;
  card: StudentCard | null;
  permit: Permit | null;
  log: ScanLog;
};
