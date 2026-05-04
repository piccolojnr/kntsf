import { Href } from "expo-router";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";

export default function OperationsSettingsScreen() {
  return (
    <RoleAccessGuard
      allowedRoles={["admin"]}
      getForbiddenHref={() => "/(operations)/scan" as Href}
    >
      <PlaceholderScreen
        title="Operations Settings"
        description="Adjust configuration and administrative settings for operations."
        screenName="operations/settings"
      />
    </RoleAccessGuard>
  );
}
