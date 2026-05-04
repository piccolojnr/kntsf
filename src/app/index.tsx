import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Href, Redirect } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

function getRoleRoute(role?: string | null): Href {
  switch (role) {
    case "student":
      return "/(student)" as Href;
    case "staff":
      return "/(staff)" as Href;
    case "admin":
      return "/(admin)" as Href;
    default:
      return "/(auth)/welcome";
  }
}

export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href={getRoleRoute(user?.role)} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
});
