import { Href } from "expo-router";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";

export default function OperationsReportsScreen() {
  return (
    <RoleAccessGuard
      allowedRoles={["admin"]}
      getForbiddenHref={() => "/(operations)/scan" as Href}
    >
      <PlaceholderScreen
        title="Reports"
        description="Review generated reports and operational insights for administrators."
        screenName="operations/reports"
      />
    </RoleAccessGuard>
  );
}
