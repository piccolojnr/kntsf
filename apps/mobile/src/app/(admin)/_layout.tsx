import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="students" />
      <Stack.Screen name="permits" />
      <Stack.Screen name="cards" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
