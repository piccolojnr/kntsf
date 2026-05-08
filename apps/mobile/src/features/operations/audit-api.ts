import { getVerificationLogs } from "./verification-api";

export type AuditLogTone = "primary" | "success" | "warning" | "danger";

export type AuditLogItem = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: string;
  tone: AuditLogTone;
};

const mockAdminLogs: AuditLogItem[] = [
  {
    id: "audit-1",
    actor: "Admin User",
    action: "Permit issued",
    timestamp: "2026-05-03T09:20:00.000Z",
    detail: "Issued a student permit from the operations workflow.",
    tone: "success",
  },
  {
    id: "audit-2",
    actor: "Admin User",
    action: "Card registered",
    timestamp: "2026-05-03T09:42:00.000Z",
    detail: "Registered a new active card for a student record.",
    tone: "primary",
  },
  {
    id: "audit-3",
    actor: "Admin User",
    action: "Card revoked",
    timestamp: "2026-05-03T11:15:00.000Z",
    detail: "Revoked a card after replacement or reported loss.",
    tone: "danger",
  },
];

function cloneAuditLog(log: AuditLogItem) {
  return { ...log };
}

export async function getAuditLogs() {
  // TODO(real-api): replace mock logs with backend audit log endpoint.
  const verificationLogs = (await getVerificationLogs()).map<AuditLogItem>(
    (log) => ({
      id: log.id,
      actor: log.method === "card_uid" ? "NFC Verification" : "Staff User",
      action: "Verification performed",
      detail: log.message,
      timestamp: log.checkedAt,
      tone: log.outcome === "allowed" ? "success" : "warning",
    }),
  );

  return [...mockAdminLogs.map(cloneAuditLog), ...verificationLogs].sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}
