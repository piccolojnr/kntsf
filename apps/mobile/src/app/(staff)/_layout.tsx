import { History, House, ScanLine, User } from "lucide-react-native";

import { RoleTabsLayout } from "@/components/layout/role-tabs-layout";

export default function StaffLayout() {
  return (
    <RoleTabsLayout
      role="staff"
      tabs={[
        { name: "index", title: "Home", icon: House },
        { name: "scan", title: "Scan", icon: ScanLine, isPrimary: true },
        { name: "history", title: "History", icon: History },
        { name: "profile", title: "Profile", icon: User },
      ]}
    />
  );
}
