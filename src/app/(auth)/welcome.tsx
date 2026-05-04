import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { RoleOptionCard } from "@/components/cards/role-option-card";
import { AuthHeader } from "@/components/ui/auth-header";
import { Screen } from "@/components/ui/screen";
import { spacing } from "@/constants/theme";
import { UserRole } from "@/features/auth/auth-types";

const roleOptions: {
  label: string;
  description: string;
  value: UserRole;
}[] = [
  {
    label: "Student",
    description: "View permits, card status, and personal profile details.",
    value: "student",
  },
  {
    label: "Staff",
    description: "Access scan tools, history, and staff profile actions.",
    value: "staff",
  },
  {
    label: "Admin",
    description: "Manage students, permits, cards, and application settings.",
    value: "admin",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <AuthHeader
          title="Knutsford SRC"
          subtitle="Select your role to continue"
        />

        <View style={styles.actions}>
          {roleOptions.map((role) => (
            <RoleOptionCard
              key={role.value}
              title={role.label}
              description={role.description}
              onPress={() =>
                router.push({
                  pathname: "/(auth)/login",
                  params: { selectedRole: role.value },
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
