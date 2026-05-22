import { Href, Stack } from "expo-router";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";

export default function StudentLayout() {
  return (
    <RoleAccessGuard
      allowedRoles={["student"]}
      getForbiddenHref={() => "/(operations)/scan" as Href}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="permit-request" options={{ headerShown: false }} />
        <Stack.Screen name="elections" options={{ headerShown: false }} />
        <Stack.Screen name="announcements" options={{ headerShown: false }} />
        <Stack.Screen name="events" options={{ headerShown: false }} />
        <Stack.Screen name="documents" options={{ headerShown: false }} />
        <Stack.Screen name="executives" options={{ headerShown: false }} />
      </Stack>
    </RoleAccessGuard>
  );
}
