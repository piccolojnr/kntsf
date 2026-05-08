import { Student } from "@/features/students/student-types";

export type CardType = "mifare_classic" | "ntag216" | "unknown";

export type CardStatus =
  | "active"
  | "revoked"
  | "lost"
  | "blocked"
  | "replaced";

export type StudentCard = {
  id: string;
  studentId: string;
  uid: string;
  type: CardType;
  status: CardStatus;
  registeredAt: string;
  uidLast4?: string;
  student?: Student | null;
};

export type StudentCardDto = Partial<StudentCard> & {
  id: string | number;
  student_id?: string;
  registered_at?: string;
  uidLast4?: string;
  uid_last4?: string;
  student?: Student | null;
};
