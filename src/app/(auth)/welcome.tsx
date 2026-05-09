import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSizes, radius, spacing } from "@/constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.inner}>
        <View style={styles.brand}>
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
              Permits, student cards, and verification tools for Knutsford SRC.
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signInButton,
            pressed && styles.signInButtonPressed,
          ]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.signInButtonText}>Sign in</Text>
          <ArrowRight color="#ffffff" size={18} strokeWidth={2.5} />
        </Pressable>
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
  brand: {
    alignItems: "center",
    gap: spacing.lg,
  },
  logo: {
    height: 88,
    width: 88,
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
    fontSize: fontSizes.sm,
    lineHeight: 20,
    maxWidth: 280,
    textAlign: "center",
  },
  signInButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  signInButtonPressed: {
    opacity: 0.78,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: fontSizes.md,
    fontWeight: "800",
  },
});
