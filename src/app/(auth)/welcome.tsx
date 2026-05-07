import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { AuthWorkspace } from "@/features/auth/auth-types";

// ─── Workspace tile ───────────────────────────────────────────────────────────

const WORKSPACES: {
  label: string;
  sublabel: string;
  value: AuthWorkspace;
  accentColor: string;
}[] = [
  {
    label: "Student",
    sublabel: "Permits · Card · Profile",
    value: "student",
    accentColor: colors.primary,
  },
  {
    label: "Operations",
    sublabel: "Staff & Admin",
    value: "operations",
    accentColor: "#0f766e",
  },
];

function WorkspaceTile({
  label,
  sublabel,
  accentColor,
  onPress,
}: (typeof WORKSPACES)[0] & { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        tileStyles.tile,
        pressed && tileStyles.tilePressed,
      ]}
      onPress={onPress}
    >
      <View style={tileStyles.body}>
        <Text style={tileStyles.label}>{label}</Text>
        <Text style={tileStyles.sublabel}>{sublabel}</Text>
      </View>

      <ArrowRight size={16} color={colors.border} strokeWidth={2.5} />
    </Pressable>
  );
}

const tileStyles = StyleSheet.create({
  tile: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  tilePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  bar: {
    borderRadius: 2,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    width: 3,
  },
  body: {
    flex: 1,
    gap: 3,
    paddingLeft: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  sublabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const router = useRouter();

  function go(workspace: AuthWorkspace) {
    router.push({
      pathname: "/(auth)/login",
      params: { selectedWorkspace: workspace },
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.inner}>
        {/* Brand block */}
        <View style={styles.brand}>
          {/* Logo */}
          <Image
            source={require("@assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.brandText}>
            <Text style={styles.brandEyebrow}>KNUTSFORD UNIVERSITY</Text>
            <Text style={styles.brandTitle}>SRC Portal</Text>
            <View style={styles.brandRule} />
            <Text style={styles.brandCaption}>
              Student Representative Council · NFC Access
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Choose workspace</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Workspace tiles */}
        <View style={styles.tiles}>
          {WORKSPACES.map((ws) => (
            <WorkspaceTile
              key={ws.value}
              {...ws}
              onPress={() => go(ws.value)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },

  // Brand
  brand: {
    alignItems: "center",
    gap: spacing.lg,
  },

  // Logo
  logo: {
    height: 80,
    width: 80,
  },
  brandText: {
    alignItems: "center",
    gap: 6,
  },
  brandEyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
  },
  brandTitle: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: "900",
    letterSpacing: -1,
  },
  brandRule: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 3,
    marginVertical: 2,
    width: 32,
  },
  brandCaption: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    letterSpacing: 0.2,
    textAlign: "center",
  },

  // Separator
  separator: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  separatorLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  separatorText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },

  // Tiles
  tiles: {
    gap: spacing.sm,
  },
});
