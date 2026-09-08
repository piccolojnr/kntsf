import { Student, StudentDto } from "@/features/students/student-types";

export type CardType = "mifare_classic" | "ntag216" | "unknown";

export type CardStatus =
  | "active"
  | "inactive"
  | "revoked"
  | "lost"
  | "stolen"
  | "blocked"
  | "replaced"
  | "damaged";

export type StudentCard = {
  id: string;
  studentId: string;
  uid: string;
  type: CardType;
  status: CardStatus;
  registeredAt: string;
  issuedAt?: string | null;
  activatedAt?: string | null;
  uidLast4?: string;
  student?: Student | null;
};

export type StudentCardDto = Omit<Partial<StudentCard>, "id" | "student"> & {
  id: string | number;
  student_id?: string | number;
  created_at?: string;
  registered_at?: string;
  issued_at?: string | null;
  activated_at?: string | null;
  issuedAt?: string;
  activatedAt?: string;
  deactivatedAt?: string;
  replacedAt?: string;
  lostAt?: string;
  createdAt?: string;
  uidLast4?: string;
  uid_last4?: string;
  status?: CardStatus;
  student?: StudentDto | null;
};
