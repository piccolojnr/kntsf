import { Href } from "expo-router";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";

export default function OperationsAuditLogsScreen() {
  return (
    <RoleAccessGuard
      allowedRoles={["admin"]}
      getForbiddenHref={() => "/(operations)/scan" as Href}
    >
      <PlaceholderScreen
        title="Audit Logs"
        description="Inspect operational audit trails and administrative activity history."
        screenName="operations/audit-logs"
      />
    </RoleAccessGuard>
  );
}
