import { Href, Tabs } from "expo-router";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { UserRole } from "@/features/auth/auth-types";

import { FloatingTabButton } from "../ui/floating-tab-button";
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

type RoleTabBarProps = BottomTabBarProps & {
  tabs: RoleTabDefinition[];
};

function RoleTabBar({ descriptors, navigation, state, tabs }: RoleTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index];
  const currentTab = tabs.find((tab) => tab.name === currentRoute.name);

  if (currentTab?.hidden) {
    return null;
  }

  const visibleTabs = tabs.filter((tab) => !tab.hidden && tab.icon);
  const tabBarWidth = Math.min(width - spacing.sm * 2, 460);

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <View
        style={[
          styles.tabBar,
          {
            marginBottom: Math.max(insets.bottom, spacing.md),
            width: tabBarWidth,
          },
        ]}
      >
        {visibleTabs.map((tab) => {
          const routeIndex = state.routes.findIndex(
            (route) => route.name === tab.name,
          );

          if (routeIndex < 0 || !tab.icon) {
            return null;
          }

          const route = state.routes[routeIndex];
          const isSelected = state.index === routeIndex;
          const descriptor = descriptors[route.key];
          const tabBarLabel =
            typeof descriptor.options.tabBarLabel === "string"
              ? descriptor.options.tabBarLabel
              : tab.title;

          return (
            <FloatingTabButton
              key={tab.name}
              icon={tab.icon}
              isPrimary={tab.isPrimary}
              isSelected={isSelected}
              label={tabBarLabel}
              onLongPress={() =>
                navigation.emit({ type: "tabLongPress", target: route.key })
              }
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isSelected && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

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
        tabBar={(props) => <RoleTabBar {...props} tabs={tabs} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
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
                title: tab.title,
                tabBarIcon: tab.hidden || !Icon ? undefined : undefined,
              }}
            />
          );
        })}
      </Tabs>
    </RoleAccessGuard>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 62,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  tabBarLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
});
