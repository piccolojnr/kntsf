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
};

export type StudentCardDto = StudentCard;
