import { Stack } from "expo-router";

export default function OperationsLayout() {
  return (
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
  );
}
