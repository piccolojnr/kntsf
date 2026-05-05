import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TextField } from "@/components/forms/text-field";
import { AuthHeader } from "@/components/ui/auth-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { fontSizes, spacing } from "@/constants/theme";
import {
  AuthWorkspace,
  LoginPayload,
  UserRole,
} from "@/features/auth/auth-types";
import { useAuth } from "@/hooks/use-auth";

function getWorkspaceTitle(workspace?: string | string[]) {
  const normalizedWorkspace = Array.isArray(workspace)
    ? workspace[0]
    : workspace;

  switch (normalizedWorkspace) {
    case "student":
      return "Student Login";
    case "operations":
      return "Operations Login";
    default:
      return "Login";
  }
}

function getRoleRoute(role: UserRole): Href {
  switch (role) {
    case "student":
      return "/(student)" as Href;
    case "staff":
    case "admin":
      return "/(operations)/scan" as Href;
  }
}

function getWorkspaceSubtitle(workspace?: string | string[]) {
  const normalizedWorkspace = Array.isArray(workspace)
    ? workspace[0]
    : workspace;

  switch (normalizedWorkspace) {
    case "student":
      return "Use your student credentials to access permits, card details, and your profile.";
    case "operations":
      return "Use your shared operations credentials. Staff and admin access are separated by backend role.";
    default:
      return "Use your credentials to continue.";
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { selectedWorkspace } = useLocalSearchParams<{
    selectedWorkspace?: AuthWorkspace;
  }>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const title = useMemo(
    () => getWorkspaceTitle(selectedWorkspace),
    [selectedWorkspace],
  );
  const subtitle = useMemo(
    () => getWorkspaceSubtitle(selectedWorkspace),
    [selectedWorkspace],
  );

  async function handleLogin() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: LoginPayload = {
        email: email.trim(),
        password,
      };

      const response = await login(payload);

      router.replace(getRoleRoute(response.user.role));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to log in";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <AuthHeader title={title} subtitle={subtitle} />

            <View style={styles.form}>
              <TextField
                label="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
              />

              <TextField
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={!isPasswordVisible}
                rightActionLabel={isPasswordVisible ? "Hide" : "Show"}
                onRightActionPress={() =>
                  setIsPasswordVisible((currentValue) => !currentValue)
                }
                value={password}
                onChangeText={setPassword}
              />

              {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
              ) : null}

              <PrimaryButton
                label="Login"
                onPress={handleLogin}
                disabled={isSubmitting}
                loading={isSubmitting}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    color: "#b42318",
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
});
