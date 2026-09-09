export type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  level: string;
  phone: string;
  accountStatus?: string;
  activeNfcCard?: {
    id: string;
    status: string;
    uidLast4?: string | null;
    uid?: string;
    registeredAt?: string;
    issuedAt?: string | null;
    activatedAt?: string | null;
  } | null;
};

export type StudentDto = Partial<Student> & {
  id: string | number;
  student_id?: string;
  student_number?: string;
  programme?: string;
  program?: string;
  number?: string;
  account_status?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  course?: string | null;
  level?: string | null;
  active_nfc_card?: {
    id: string | number;
    status?: string;
    uid_last4?: string | null;
    issued_at?: string | null;
    activated_at?: string | null;
  } | null;
  nfc_card?: {
    id: string | number;
    status?: string;
    uid_last4?: string | null;
    issued_at?: string | null;
    activated_at?: string | null;
  } | null;
};

export type MobileHomeContentItem = {
  id: string | number;
  slug?: string;
  title?: string;
  excerpt?: string | null;
  published_at?: string | null;
  starts_at?: string | null;
  image_url?: string | null;
};

export type MobileHomeContent = {
  announcements: MobileHomeContentItem[];
  events: MobileHomeContentItem[];
  documents: MobileHomeContentItem[];
  executives: MobileHomeContentItem[];
};
