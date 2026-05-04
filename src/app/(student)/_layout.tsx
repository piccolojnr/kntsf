import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="permits" />
      <Stack.Screen name="card" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
