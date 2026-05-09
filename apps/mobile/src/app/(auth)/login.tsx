import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/ui/primary-button";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  AuthWorkspace,
  LoginPayload,
  UserRole,
} from "@/features/auth/auth-types";
import { useAuth } from "@/hooks/use-auth";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleRoute(role: UserRole): Href {
  switch (role) {
    case "student":
      return "/(student)" as Href;
    case "staff":
    case "admin":
      return "/(operations)/scan" as Href;
  }
}

const WORKSPACE_META: Record<
  string,
  { title: string; pill: string; accentColor: string }
> = {
  student: {
    title: "Sign in",
    pill: "Student",
    accentColor: colors.primary,
  },
  operations: {
    title: "Sign in",
    pill: "Operations",
    accentColor: "#0f766e",
  },
};

function getWorkspaceMeta(workspace?: string | string[]) {
  const ws = Array.isArray(workspace) ? workspace[0] : workspace;
  return (
    WORKSPACE_META[ws ?? ""] ?? {
      title: "Sign in",
      pill: "Workspace",
      accentColor: colors.primary,
    }
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  onFocus,
  onToggleSecure,
  showSecure,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences";
  keyboardType?: "email-address" | "default";
  onFocus?: () => void;
  onToggleSecure?: () => void;
  showSecure?: boolean;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={fieldStyles.row}>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.border}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize ?? "sentences"}
          keyboardType={keyboardType ?? "default"}
          autoCorrect={false}
          onFocus={onFocus}
          selectionColor={colors.primary}
        />
        {onToggleSecure && (
          <TouchableOpacity onPress={onToggleSecure} style={fieldStyles.eyeBtn}>
            {showSecure ? (
              <EyeOff size={16} color={colors.textMuted} strokeWidth={2} />
            ) : (
              <Eye size={16} color={colors.textMuted} strokeWidth={2} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.md,
    paddingVertical: spacing.md,
  },
  eyeBtn: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 32,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { selectedWorkspace } = useLocalSearchParams<{
    selectedWorkspace?: AuthWorkspace;
  }>();
  const { login } = useAuth();
  const meta = useMemo(
    () => getWorkspaceMeta(selectedWorkspace),
    [selectedWorkspace],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [androidKeyboardInset, setAndroidKeyboardInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setAndroidKeyboardInset(event.endCoordinates.height + spacing.md);
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function handleInputFocus() {
    if (Platform.OS !== "android") {
      return;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }

  async function handleLogin() {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload: LoginPayload = { username: email.trim(), password };
      const response = await login(payload);
      router.replace(getRoleRoute(response.user.role));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scroll,
            androidKeyboardInset > 0 && {
              justifyContent: "flex-start",
              paddingBottom: androidKeyboardInset,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.5 },
            ]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={16} color={colors.textMuted} strokeWidth={2.5} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            {/* Workspace pill */}
            <View
              style={[
                styles.pill,
                { backgroundColor: `${meta.accentColor}15` },
              ]}
            >
              <View
                style={[styles.pillDot, { backgroundColor: meta.accentColor }]}
              />
              <Text style={[styles.pillText, { color: meta.accentColor }]}>
                {meta.pill}
              </Text>
            </View>

            <Text style={styles.title}>{meta.title}</Text>
            <Text style={styles.subtitle}>
              Enter your credentials to access the {meta.pill.toLowerCase()}{" "}
              workspace.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={handleInputFocus}
            />

            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              onFocus={handleInputFocus}
              onToggleSecure={() => setShowPassword((v) => !v)}
              showSecure={showPassword}
            />

            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <PrimaryButton
              label="Sign In"
              onPress={handleLogin}
              disabled={isSubmitting || !email || !password}
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  // Back
  backBtn: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.xs,
  },
  backLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },

  // Header
  header: {
    gap: spacing.sm,
  },
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  pillDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  pillText: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },

  // Form
  form: {
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    fontWeight: "600",
    textAlign: "center",
  },
});
