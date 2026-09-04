import { Href, Redirect } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleRoute(role?: string | null): Href {
  switch (role) {
    case "student":
      return "/(student)" as Href;
    case "staff":
    case "admin":
      return "/(operations)/scan" as Href;
    default:
      return "/(auth)/welcome";
  }
}

// ─── Branded loading screen ───────────────────────────────────────────────────

function LoadingScreen({
  message,
  onRetry,
  onSignOut,
}: {
  message?: string;
  onRetry?: () => void;
  onSignOut?: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const dotScale1 = useRef(new Animated.Value(0.5)).current;
  const dotScale2 = useRef(new Animated.Value(0.5)).current;
  const dotScale3 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Fade in the logo
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Staggered dot pulse
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim = Animated.parallel([
      pulse(dotScale1, 0),
      pulse(dotScale2, 180),
      pulse(dotScale3, 360),
    ]);
    anim.start();
    return () => anim.stop();
  }, [dotScale1, dotScale2, dotScale3, opacity]);

  return (
    <SafeAreaView style={styles.screen}>
      <Animated.View style={[styles.content, { opacity }]}>
        {/* Logo */}
        <Image
          source={require("@assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* App name */}
        <View style={styles.nameBlock}>
          <Text style={styles.eyebrow}>KNUTSFORD UNIVERSITY</Text>
          <Text style={styles.appName}>SRC Portal</Text>
        </View>

        {/* Dot pulse loader */}
        <View style={styles.dots}>
          {[dotScale1, dotScale2, dotScale3].map((scale, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ scale }] }]}
            />
          ))}
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {onRetry ? (
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={onRetry}>
              <Text style={styles.actionLabel}>Retry</Text>
            </Pressable>
            {onSignOut ? (
              <Pressable onPress={onSignOut}>
                <Text style={styles.signOutLabel}>Sign out</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Index() {
  const { authError, isLoading, isAuthenticated, logout, retryAuth, token, user } =
    useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (token && authError) {
    return (
      <LoadingScreen
        message={authError}
        onRetry={() => void retryAuth()}
        onSignOut={() => void logout()}
      />
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href={getRoleRoute(user?.role)} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  // Logo
  logo: {
    height: 96,
    width: 96,
  },

  // Name
  nameBlock: {
    alignItems: "center",
    gap: 4,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: fontSizes.xxs,
    fontWeight: "600",
    letterSpacing: 2,
  },
  appName: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // Dots
  dots: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dot: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    maxWidth: 280,
    textAlign: "center",
  },
  actions: {
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    color: colors.background,
    fontSize: fontSizes.sm,
    fontWeight: "700",
  },
  signOutLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
});
