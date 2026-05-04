import { useState } from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, LogOut } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";

type PlaceholderScreenProps = {
  title: string;
  description: string;
  screenName: string;
  showLogout?: boolean;
};

export function PlaceholderScreen({
  title,
  description,
  screenName,
  showLogout = false,
}: PlaceholderScreenProps) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/(auth)/welcome");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Screen>
      <View style={styles.screen}>
        <View style={styles.actions}>
          {router.canGoBack() ? (
            <Pressable style={styles.secondaryButton} onPress={router.back}>
              <View style={styles.secondaryButtonContent}>
                <ChevronLeft color={colors.text} size={16} strokeWidth={2.2} />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </View>
            </Pressable>
          ) : (
            <View />
          )}

          {isAuthenticated && showLogout ? (
            <Pressable
              style={[
                styles.secondaryButton,
                isLoggingOut && styles.secondaryButtonDisabled,
              ]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <View style={styles.secondaryButtonContent}>
                <LogOut color={colors.text} size={16} strokeWidth={2.2} />
                <Text style={styles.secondaryButtonText}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.screenName}>{screenName}</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    color: colors.text,
    fontSize: fontSizes.md,
    lineHeight: 24,
    maxWidth: 320,
    textAlign: "center",
  },
  screenName: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "500",
    textAlign: "center",
  },
  secondaryButton: {
    minWidth: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonDisabled: {
    opacity: 0.7,
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    textAlign: "center",
  },
});
