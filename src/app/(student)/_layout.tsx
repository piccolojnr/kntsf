import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="permit-request" options={{ headerShown: false }} />
      <Stack.Screen name="elections" options={{ headerShown: false }} />
      <Stack.Screen name="announcements" options={{ headerShown: false }} />
      <Stack.Screen name="events" options={{ headerShown: false }} />
      <Stack.Screen name="documents" options={{ headerShown: false }} />
      <Stack.Screen name="executives" options={{ headerShown: false }} />
    </Stack>
  );
}
