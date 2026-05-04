import { Tabs } from "expo-router";
import { Href } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { UserRole } from "@/features/auth/auth-types";

import { RoleAccessGuard } from "./role-access-guard";

type RoleTabDefinition = {
  name: string;
  title: string;
  icon?: LucideIcon;
  isPrimary?: boolean;
  hidden?: boolean;
};

type RoleTabsLayoutProps = {
  allowedRoles: UserRole[];
  initialRouteName: string;
  tabs: RoleTabDefinition[];
  getForbiddenHref?: (role?: UserRole | null) => Href;
};

export function RoleTabsLayout({
  allowedRoles,
  initialRouteName,
  tabs,
  getForbiddenHref,
}: RoleTabsLayoutProps) {
  return (
    <RoleAccessGuard
      allowedRoles={allowedRoles}
      getForbiddenHref={getForbiddenHref}
    >
      <Tabs
        initialRouteName={initialRouteName}
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
                href: tab.hidden ? null : undefined,
                tabBarStyle: tab.hidden ? { display: "none" } : styles.tabBar,
                title: tab.title,
                tabBarIcon:
                  tab.hidden || !Icon
                    ? undefined
                    : ({ color, focused, size }) => (
                        <View
                          style={[
                            styles.iconWrap,
                            tab.isPrimary && styles.primaryIconWrap,
                            focused &&
                              tab.isPrimary &&
                              styles.primaryIconWrapFocused,
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
    </RoleAccessGuard>
  );
}

const styles = StyleSheet.create({
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
