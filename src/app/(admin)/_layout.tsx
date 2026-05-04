import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react-native";

import { RoleTabsLayout } from "@/components/layout/role-tabs-layout";

export default function AdminLayout() {
  return (
    <RoleTabsLayout
      role="admin"
      tabs={[
        { name: "index", title: "Dashboard", icon: LayoutDashboard },
        { name: "students", title: "Students", icon: Users },
        { name: "permits", title: "Permits", icon: FileText },
        { name: "cards", title: "Cards", icon: CreditCard },
        { name: "settings", title: "Settings", icon: Settings },
      ]}
    />
  );
}
