import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

import { Screen } from "@/components/ui/screen";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { UserRole } from "@/features/auth/auth-types";
import { useAuth } from "@/hooks/use-auth";

type RoleTabDefinition = {
  name: string;
  title: string;
  icon: LucideIcon;
  isPrimary?: boolean;
};

type RoleTabsLayoutProps = {
  role: UserRole;
  tabs: RoleTabDefinition[];
};

export function RoleTabsLayout({ role, tabs }: RoleTabsLayoutProps) {
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

  if (user?.role !== role) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, focused, size }) => (
                <View
                  style={[
                    styles.iconWrap,
                    tab.isPrimary && styles.primaryIconWrap,
                    focused && tab.isPrimary && styles.primaryIconWrapFocused,
                  ]}
                >
                  <Icon
                    color={
                      tab.isPrimary
                        ? focused
                          ? "#ffffff"
                          : colors.primary
                        : color
                    }
                    size={tab.isPrimary ? size + 2 : size}
                    strokeWidth={focused ? 2.4 : 2}
                  />
                </View>
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    height: 76,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
  tabBarLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  primaryIconWrap: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  primaryIconWrapFocused: {
    backgroundColor: colors.primary,
  },
});
