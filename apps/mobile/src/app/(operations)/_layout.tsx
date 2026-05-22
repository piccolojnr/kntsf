import { Href, Stack } from "expo-router";

import { RoleAccessGuard } from "@/components/layout/role-access-guard";

export default function OperationsLayout() {
  return (
    <RoleAccessGuard
      allowedRoles={["staff", "admin"]}
      getForbiddenHref={() => "/(student)" as Href}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="student-details"
          options={{
            headerShown: false,
            gestureEnabled: true,
            presentation: "formSheet",
          }}
        />
        <Stack.Screen
          name="card-assignment"
          options={{
            headerShown: false,
            gestureEnabled: true,
            presentation: "formSheet",
          }}
        />
        <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="cards" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="audit-logs" options={{ headerShown: false }} />
        <Stack.Screen name="reports" options={{ headerShown: false }} />
      </Stack>
    </RoleAccessGuard>
  );
}
