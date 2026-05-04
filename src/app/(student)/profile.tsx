import { LogOut } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ProfileHeaderCard } from "@/components/cards/profile-header-card";
import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { DetailRow } from "@/components/ui/detail-row";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function StudentProfileScreen() {
  const { logout, user } = useAuth();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeaderCard
          email={user?.email ?? "student@example.com"}
          name={user?.name ?? "Student User"}
          role={user?.role ?? "student"}
          subtitle="Your student workspace keeps your permit and SRC card access in one place."
          workspaceLabel="Student"
        />

        <View style={styles.statusGrid}>
          <StatusCard
            title="Permit Access"
            value="Ready"
            description="Permit features are available once your application window opens."
            tone="success"
          />
          <StatusCard
            title="SRC Card"
            value="Active"
            description="Your digital card space is prepared for future verification flows."
          />
        </View>

        <SectionCard title="Account Overview">
          <DetailRow
            label="Workspace"
            value="Student"
            helper="This side is reserved for student records and self-service features."
          />
          <DetailRow
            label="Sign-in Email"
            value={user?.email ?? "student@example.com"}
            helper="Use the same email when accessing future student-only services."
          />
          <DetailRow
            label="Status"
            value="Good Standing"
            helper="Your account is active and ready for permit and card features."
          />
        </SectionCard>

        <SectionCard title="Support">
          <DetailRow
            label="Permit Help"
            value="Student Affairs"
            helper="Permit requests and follow-up actions will be managed from this workspace."
          />
          <DetailRow
            label="Card Support"
            value="SRC Office"
            helper="Card replacements and verification support will appear here once enabled."
          />
        </SectionCard>

        <PrimaryButton
          label="Logout"
          icon={LogOut}
          onPress={logout}
          variant="danger"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl + 72,
  },
  statusGrid: {
    gap: spacing.md,
  },
});
