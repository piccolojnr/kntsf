import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { RoleOptionCard } from "@/components/cards/role-option-card";
import { AuthHeader } from "@/components/ui/auth-header";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";
import { AuthWorkspace } from "@/features/auth/auth-types";

const workspaceOptions: {
  label: string;
  description: string;
  value: AuthWorkspace;
}[] = [
  {
    label: "Student",
    description: "Sign in to the student side to view permits, card status, and personal details.",
    value: "student",
  },
  {
    label: "Operations",
    description: "Sign in to the shared operations side used by both staff and admin roles.",
    value: "operations",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <AuthHeader
          title="Knutsford SRC"
          subtitle="Choose the side of the app you want to access"
        />

        <View style={styles.actions}>
          {workspaceOptions.map((workspace) => (
            <RoleOptionCard
              key={workspace.value}
              title={workspace.label}
              description={workspace.description}
              onPress={() =>
                router.push({
                  pathname: "/(auth)/login",
                  params: { selectedWorkspace: workspace.value },
                })
              }
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
});
