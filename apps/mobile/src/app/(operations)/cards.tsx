import { Href } from "expo-router";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";

export default function OperationsCardsScreen() {
  return (
    <RoleAccessGuard
      allowedRoles={["admin"]}
      getForbiddenHref={() => "/(operations)/scan" as Href}
    >
      <PlaceholderScreen
        title="Operations Cards"
        description="Manage card inventory, card lifecycle tasks, and replacement records."
        screenName="operations/cards"
      />
    </RoleAccessGuard>
  );
}
