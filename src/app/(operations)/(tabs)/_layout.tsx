import { Href } from "expo-router";
import {
  FileText,
  ScanLine,
  User,
  Users,
} from "lucide-react-native";

import { RoleTabsLayout } from "@/components/layout/role-tabs-layout";
import { UserRole } from "@/features/auth/auth-types";

function getOperationsForbiddenHref(role?: UserRole | null): Href {
  if (role === "student") {
    return "/(student)" as Href;
  }

  return "/" as Href;
}

export default function OperationsLayout() {
  return (
    <RoleTabsLayout
      allowedRoles={["staff", "admin"]}
      initialRouteName="scan"
      getForbiddenHref={getOperationsForbiddenHref}
      tabs={[
        { name: "scan", title: "Verify", icon: ScanLine },
        { name: "permits", title: "Permits", icon: FileText },
        { name: "students", title: "Students", icon: Users },
        { name: "profile", title: "Profile", icon: User },
      ]}
    />
  );
}
