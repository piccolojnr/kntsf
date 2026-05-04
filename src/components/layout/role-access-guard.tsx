import { Href, Redirect } from "expo-router";
import { PropsWithChildren } from "react";
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

/**
 * A component that guards access to its children based on the user's role.
 * It checks if the user is authenticated and if their role is included in the allowedRoles array.
 * If the user is not authenticated, they are redirected to the unauthenticatedHref.
 * If the user is authenticated but does not have the required role, they are redirected to a forbidden page determined by getForbiddenHref.
 *
 * @param allowedRoles - An array of user roles that are allowed to access the children components.
 * @param unauthenticatedHref - The href to redirect to if the user is not authenticated. Defaults to "/(auth)/welcome".
 * @param getForbiddenHref - A function that returns the href to redirect to if the user does not have the required role. It receives the user's role as an argument.
 * @param children - The components that should be rendered if access is granted.
 */
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
