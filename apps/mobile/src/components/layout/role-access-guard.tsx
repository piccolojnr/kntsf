import { PropsWithChildren } from "react";
import { Href, Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { colors } from "@/constants/theme";
import { UserRole } from "@/features/auth/auth-types";
import { useAuth } from "@/hooks/use-auth";

type RoleAccessGuardProps = PropsWithChildren<{
  allowedRoles: UserRole[];
  unauthenticatedHref?: Href;
  getForbiddenHref?: (role?: UserRole | null) => Href;
}>;

export function RoleAccessGuard({
  allowedRoles,
  unauthenticatedHref = "/(auth)/welcome",
  getForbiddenHref = () => "/" as Href,
  children,
}: RoleAccessGuardProps) {
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
    return <Redirect href={unauthenticatedHref} />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Redirect href={getForbiddenHref(user?.role)} />;
  }

  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
