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
};

export type PermitIssuanceConfig = {
  enabled: boolean;
  defaultAmount: number;
  currency?: string;
  expiryDate: string;
  academicYear: string | null;
};

export type PermitDto = Permit;
export type PermitIssuanceConfigDto = PermitIssuanceConfig;
