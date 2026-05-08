export type PermitStatus = "active" | "expired" | "revoked";

export type Permit = {
  id: string;
  studentId: string;
  permitCode: string;
  status: PermitStatus;
  startDate: string;
  expiryDate: string;
  amountPaid: number;
};

export type PermitIssuanceConfig = {
  enabled: boolean;
  defaultAmount: number;
  expiryDate: string;
  academicYear: string;
};

export type PermitDto = Permit;
export type PermitIssuanceConfigDto = PermitIssuanceConfig;
