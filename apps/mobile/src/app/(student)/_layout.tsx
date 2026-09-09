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
        <Stack.Screen name="permit-request/index" options={{ headerShown: false }} />
        <Stack.Screen name="permit-request/[reference]" options={{ headerShown: false }} />
        <Stack.Screen name="permit-request/payment-return" options={{ headerShown: false }} />
        <Stack.Screen name="elections/index" options={{ headerShown: false }} />
        <Stack.Screen name="elections/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="elections/[id]/results" options={{ headerShown: false }} />
        <Stack.Screen name="announcements/index" options={{ headerShown: false }} />
        <Stack.Screen name="announcements/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="events/index" options={{ headerShown: false }} />
        <Stack.Screen name="events/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="documents/index" options={{ headerShown: false }} />
        <Stack.Screen name="documents/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="executives/index" options={{ headerShown: false }} />
      </Stack>
    </RoleAccessGuard>
  );
}
