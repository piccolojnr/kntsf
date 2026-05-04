import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  ScanLine,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react-native";
import { Href } from "expo-router";

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
        { name: "scan", title: "Scan", icon: ScanLine },
        { name: "permits", title: "Permits", icon: FileText },
        { name: "students", title: "Students", icon: Users },
        { name: "profile", title: "Profile", icon: User },
        { name: "admin-dashboard", title: "Dashboard", hidden: true, icon: LayoutDashboard },
        { name: "cards", title: "Cards", hidden: true, icon: CreditCard },
        { name: "settings", title: "Settings", hidden: true, icon: Settings },
        { name: "audit-logs", title: "Audit Logs", hidden: true, icon: Shield },
        { name: "reports", title: "Reports", hidden: true, icon: BarChart3 },
      ]}
    />
  );
}
