import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="permit-request" options={{ headerShown: false }} />
      <Stack.Screen name="elections" options={{ headerShown: false }} />
    </Stack>
  );
}
