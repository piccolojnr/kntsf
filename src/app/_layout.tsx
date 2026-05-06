import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "react-native-reanimated";

import { AppProviders } from "@/providers/app-providers";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AppProviders>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(student)" options={{ headerShown: false }} />
            <Stack.Screen name="(operations)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </AppProviders>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
