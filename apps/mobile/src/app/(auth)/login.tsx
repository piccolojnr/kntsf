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
import { LoginPayload, UserRole } from "@/features/auth/auth-types";
import { useAuth } from "@/hooks/use-auth";

function getRoleTitle(role?: string | string[]) {
  const normalizedRole = Array.isArray(role) ? role[0] : role;

  switch (normalizedRole) {
    case "student":
      return "Student Login";
    case "staff":
      return "Staff Login";
    case "admin":
      return "Admin Login";
    default:
      return "Login";
  }
}

function getRoleRoute(role: UserRole): Href {
  switch (role) {
    case "student":
      return "/(student)" as Href;
    case "staff":
      return "/(staff)" as Href;
    case "admin":
      return "/(admin)" as Href;
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { selectedRole } = useLocalSearchParams<{ selectedRole?: UserRole }>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const title = useMemo(() => getRoleTitle(selectedRole), [selectedRole]);

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
            <AuthHeader
              title={title}
              subtitle="Use the mock credentials for your selected role."
            />

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
