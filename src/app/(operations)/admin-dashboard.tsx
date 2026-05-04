import { Href } from "expo-router";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";

export default function AdminDashboardScreen() {
  return (
    <RoleAccessGuard
      allowedRoles={["admin"]}
      getForbiddenHref={() => "/(operations)/scan" as Href}
    >
      <PlaceholderScreen
        title="Admin Dashboard"
        description="Monitor operational metrics and key administrative summaries."
        screenName="operations/admin-dashboard"
      />
    </RoleAccessGuard>
  );
}
